#include <algorithm>
#include <ctype.h>
#include <errno.h>
#include <math.h>
#include <stdio.h>
#include <stdlib.h>
#include <string.h>

#include <map>
#include <sstream>
#include <stdexcept>
#include <string>
#include <thread>
#include <utility>
#include <vector>

#ifdef _WIN32
#define WIN32_LEAN_AND_MEAN
#include <winsock2.h>
#include <ws2tcpip.h>
#include <windows.h>
#else
#include <arpa/inet.h>
#include <fcntl.h>
#include <netinet/in.h>
#include <signal.h>
#include <sys/socket.h>
#include <sys/types.h>
#include <sys/wait.h>
#include <unistd.h>
#endif

namespace {

#ifdef _WIN32
using socket_t = SOCKET;
constexpr socket_t kInvalid = INVALID_SOCKET;
#else
using socket_t = int;
constexpr socket_t kInvalid = -1;
#endif

void sock_close(socket_t fd) {
#ifdef _WIN32
  closesocket(fd);
#else
  close(fd);
#endif
}

int sock_send(socket_t fd, const char* p, int n) {
#ifdef _WIN32
  return send(fd, p, n, 0);
#else
  return static_cast<int>(::write(fd, p, static_cast<size_t>(n)));
#endif
}

int sock_recv(socket_t fd, char* p, int n) {
#ifdef _WIN32
  return recv(fd, p, n, 0);
#else
  return static_cast<int>(::read(fd, p, static_cast<size_t>(n)));
#endif
}

const char* UA =
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
    "(KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36";

struct Json {
  enum Type { NUL, BOOL, NUM, STR, ARR, OBJ } type = NUL;
  bool b = false;
  double num = 0;
  std::string str;
  std::vector<Json> arr;
  std::vector<std::pair<std::string, Json>> obj;
};

struct ParseError : std::runtime_error {
  using std::runtime_error::runtime_error;
};

class Parser {
 public:
  explicit Parser(const std::string& s) : s_(s) {}

  Json parse() {
    skip();
    Json v = value();
    skip();
    return v;
  }

 private:
  const std::string& s_;
  size_t i_ = 0;

  void skip() {
    while (i_ < s_.size() && isspace(static_cast<unsigned char>(s_[i_]))) i_++;
  }

  char peek() { return i_ < s_.size() ? s_[i_] : 0; }

  char get() {
    if (i_ >= s_.size()) throw ParseError("truncated json");
    return s_[i_++];
  }

  Json value() {
    skip();
    char c = peek();
    if (c == '{') return object();
    if (c == '[') return array();
    if (c == '"') {
      Json j;
      j.type = Json::STR;
      j.str = string();
      return j;
    }
    if (c == 't' || c == 'f') return boolean();
    if (c == 'n') return null();
    if (c == '-' || isdigit(static_cast<unsigned char>(c))) return number();
    throw ParseError("bad json");
  }

  Json object() {
    get();
    Json j;
    j.type = Json::OBJ;
    skip();
    if (peek() == '}') {
      get();
      return j;
    }
    while (true) {
      skip();
      if (peek() != '"') throw ParseError("object key");
      std::string key = string();
      skip();
      if (get() != ':') throw ParseError("object colon");
      j.obj.emplace_back(key, value());
      skip();
      char c = get();
      if (c == '}') break;
      if (c != ',') throw ParseError("object comma");
    }
    return j;
  }

  Json array() {
    get();
    Json j;
    j.type = Json::ARR;
    skip();
    if (peek() == ']') {
      get();
      return j;
    }
    while (true) {
      j.arr.push_back(value());
      skip();
      char c = get();
      if (c == ']') break;
      if (c != ',') throw ParseError("array comma");
    }
    return j;
  }

  std::string string() {
    if (get() != '"') throw ParseError("string");
    std::string out;
    while (true) {
      if (i_ >= s_.size()) throw ParseError("string eof");
      char c = get();
      if (c == '"') break;
      if (c == '\\') {
        char e = get();
        if (e == '"' || e == '\\' || e == '/') out.push_back(e);
        else if (e == 'b') out.push_back('\b');
        else if (e == 'f') out.push_back('\f');
        else if (e == 'n') out.push_back('\n');
        else if (e == 'r') out.push_back('\r');
        else if (e == 't') out.push_back('\t');
        else if (e == 'u') {
          int cp = 0;
          for (int k = 0; k < 4; k++) {
            char h = get();
            cp <<= 4;
            if (h >= '0' && h <= '9') cp += h - '0';
            else if (h >= 'a' && h <= 'f') cp += h - 'a' + 10;
            else if (h >= 'A' && h <= 'F') cp += h - 'A' + 10;
            else throw ParseError("bad unicode");
          }
          if (cp < 0x80) out.push_back(static_cast<char>(cp));
          else if (cp < 0x800) {
            out.push_back(static_cast<char>(0xC0 | (cp >> 6)));
            out.push_back(static_cast<char>(0x80 | (cp & 0x3F)));
          } else {
            out.push_back(static_cast<char>(0xE0 | (cp >> 12)));
            out.push_back(static_cast<char>(0x80 | ((cp >> 6) & 0x3F)));
            out.push_back(static_cast<char>(0x80 | (cp & 0x3F)));
          }
        } else throw ParseError("bad escape");
      } else out.push_back(c);
    }
    return out;
  }

  Json boolean() {
    Json j;
    j.type = Json::BOOL;
    if (s_.compare(i_, 4, "true") == 0) {
      j.b = true;
      i_ += 4;
    } else if (s_.compare(i_, 5, "false") == 0) {
      j.b = false;
      i_ += 5;
    } else throw ParseError("bool");
    return j;
  }

  Json null() {
    if (s_.compare(i_, 4, "null") != 0) throw ParseError("null");
    i_ += 4;
    return Json{};
  }

  Json number() {
    size_t start = i_;
    if (peek() == '-') get();
    while (isdigit(static_cast<unsigned char>(peek()))) get();
    if (peek() == '.') {
      get();
      while (isdigit(static_cast<unsigned char>(peek()))) get();
    }
    if (peek() == 'e' || peek() == 'E') {
      get();
      if (peek() == '+' || peek() == '-') get();
      while (isdigit(static_cast<unsigned char>(peek()))) get();
    }
    Json j;
    j.type = Json::NUM;
    j.num = strtod(s_.c_str() + start, nullptr);
    return j;
  }
};

const Json* field(const Json* j, const char* key) {
  if (!j || j->type != Json::OBJ) return nullptr;
  for (const auto& kv : j->obj)
    if (kv.first == key) return &kv.second;
  return nullptr;
}

const Json* at(const Json* j, size_t i) {
  if (!j || j->type != Json::ARR || i >= j->arr.size()) return nullptr;
  return &j->arr[i];
}

std::string as_string(const Json* j, const std::string& fallback = "") {
  if (!j) return fallback;
  if (j->type == Json::STR) return j->str;
  if (j->type == Json::NUM) {
    std::ostringstream os;
    os << j->num;
    return os.str();
  }
  return fallback;
}

bool as_number(const Json* j, double& out) {
  if (!j) return false;
  if (j->type == Json::NUM && std::isfinite(j->num)) {
    out = j->num;
    return true;
  }
  return false;
}

std::string json_escape(const std::string& s) {
  std::string o;
  o.reserve(s.size() + 8);
  for (unsigned char c : s) {
    switch (c) {
      case '"': o += "\\\""; break;
      case '\\': o += "\\\\"; break;
      case '\b': o += "\\b"; break;
      case '\f': o += "\\f"; break;
      case '\n': o += "\\n"; break;
      case '\r': o += "\\r"; break;
      case '\t': o += "\\t"; break;
      default:
        if (c < 0x20) {
          char buf[8];
          snprintf(buf, sizeof(buf), "\\u%04x", c);
          o += buf;
        } else o.push_back(static_cast<char>(c));
    }
  }
  return o;
}

std::string fmt_num(double x) {
  if (!std::isfinite(x)) return "null";
  char buf[64];
  snprintf(buf, sizeof(buf), "%.8f", x);
  std::string s(buf);
  while (s.size() > 1 && s.back() == '0') s.pop_back();
  if (!s.empty() && s.back() == '.') s.pop_back();
  if (s == "-0") s = "0";
  return s;
}

std::string quote_str(const std::string& s) { return "\"" + json_escape(s) + "\""; }

bool valid_symbol(const std::string& s) {
  if (s.empty() || s.size() > 16) return false;
  for (char c : s) {
    if (!(isalnum(static_cast<unsigned char>(c)) || c == '.' || c == '^' || c == '|' || c == '=' || c == '-'))
      return false;
  }
  return true;
}

std::string upper_trim(std::string s) {
  size_t a = 0;
  while (a < s.size() && isspace(static_cast<unsigned char>(s[a]))) a++;
  size_t b = s.size();
  while (b > a && isspace(static_cast<unsigned char>(s[b - 1]))) b--;
  std::string o = s.substr(a, b - a);
  for (char& c : o) c = static_cast<char>(toupper(static_cast<unsigned char>(c)));
  return o;
}

std::string url_encode(const std::string& s) {
  static const char* hex = "0123456789ABCDEF";
  std::string o;
  for (unsigned char c : s) {
    if (isalnum(c) || c == '-' || c == '_' || c == '.' || c == '~') o.push_back(static_cast<char>(c));
    else {
      o.push_back('%');
      o.push_back(hex[c >> 4]);
      o.push_back(hex[c & 15]);
    }
  }
  return o;
}

std::string curl_io(const std::vector<std::string>& args, const std::string* body) {
#ifdef _WIN32
  auto quote = [](const std::string& s) {
    std::string o = "\"";
    for (char c : s) {
      if (c == '\\' || c == '"') o.push_back('\\');
      o.push_back(c);
    }
    o.push_back('"');
    return o;
  };
  std::string cmd = "curl";
  for (const auto& a : args) {
    cmd.push_back(' ');
    cmd += quote(a);
  }
  SECURITY_ATTRIBUTES sa{};
  sa.nLength = sizeof(sa);
  sa.bInheritHandle = TRUE;
  HANDLE out_read = nullptr, out_write = nullptr, in_read = nullptr, in_write = nullptr;
  if (!CreatePipe(&out_read, &out_write, &sa, 0)) throw std::runtime_error("pipe");
  SetHandleInformation(out_read, HANDLE_FLAG_INHERIT, 0);
  if (body) {
    if (!CreatePipe(&in_read, &in_write, &sa, 0)) throw std::runtime_error("pipe");
    SetHandleInformation(in_write, HANDLE_FLAG_INHERIT, 0);
  }
  STARTUPINFOA si{};
  si.cb = sizeof(si);
  si.dwFlags = STARTF_USESTDHANDLES | STARTF_USESHOWWINDOW;
  si.wShowWindow = SW_HIDE;
  si.hStdInput = body ? in_read : GetStdHandle(STD_INPUT_HANDLE);
  si.hStdOutput = out_write;
  si.hStdError = GetStdHandle(STD_ERROR_HANDLE);
  PROCESS_INFORMATION pi{};
  std::vector<char> line(cmd.begin(), cmd.end());
  line.push_back('\0');
  if (!CreateProcessA(nullptr, line.data(), nullptr, nullptr, TRUE, CREATE_NO_WINDOW, nullptr, nullptr, &si, &pi)) {
    throw std::runtime_error("curl is not installed or not on PATH");
  }
  CloseHandle(out_write);
  if (body) {
    CloseHandle(in_read);
    const char* p = body->data();
    size_t left = body->size();
    while (left) {
      DWORD n = 0;
      DWORD chunk = static_cast<DWORD>(left > 1 << 20 ? 1 << 20 : left);
      if (!WriteFile(in_write, p, chunk, &n, nullptr)) break;
      p += n;
      left -= n;
    }
    CloseHandle(in_write);
  }
  std::string out;
  char buf[8192];
  DWORD n = 0;
  while (ReadFile(out_read, buf, sizeof(buf), &n, nullptr) && n > 0) out.append(buf, buf + n);
  CloseHandle(out_read);
  WaitForSingleObject(pi.hProcess, INFINITE);
  DWORD code = 1;
  GetExitCodeProcess(pi.hProcess, &code);
  CloseHandle(pi.hProcess);
  CloseHandle(pi.hThread);
  if (code != 0) throw std::runtime_error("Market data error");
  return out;
#else
  int inpipe[2] = {-1, -1};
  int outpipe[2] = {-1, -1};
  if (pipe(outpipe) != 0) throw std::runtime_error("pipe");
  if (body && pipe(inpipe) != 0) throw std::runtime_error("pipe");
  pid_t pid = fork();
  if (pid < 0) throw std::runtime_error("fork");
  if (pid == 0) {
    dup2(outpipe[1], STDOUT_FILENO);
    if (body) dup2(inpipe[0], STDIN_FILENO);
    else {
      int devnull = open("/dev/null", O_RDONLY);
      if (devnull >= 0) dup2(devnull, STDIN_FILENO);
    }
    int err = open("/dev/null", O_WRONLY);
    if (err >= 0) dup2(err, STDERR_FILENO);
    close(outpipe[0]);
    close(outpipe[1]);
    if (body) {
      close(inpipe[0]);
      close(inpipe[1]);
    }
    std::vector<char*> argv;
    argv.push_back(const_cast<char*>("curl"));
    for (const auto& a : args) argv.push_back(const_cast<char*>(a.c_str()));
    argv.push_back(nullptr);
    execvp("curl", argv.data());
    _exit(127);
  }
  close(outpipe[1]);
  if (body) {
    close(inpipe[0]);
    const char* p = body->data();
    size_t left = body->size();
    while (left) {
      ssize_t n = write(inpipe[1], p, left);
      if (n < 0) break;
      p += n;
      left -= static_cast<size_t>(n);
    }
    close(inpipe[1]);
  }
  std::string out;
  char buf[8192];
  while (true) {
    ssize_t n = read(outpipe[0], buf, sizeof(buf));
    if (n < 0) {
      if (errno == EINTR) continue;
      break;
    }
    if (n == 0) break;
    out.append(buf, buf + n);
  }
  close(outpipe[0]);
  int status = 0;
  waitpid(pid, &status, 0);
  if (!WIFEXITED(status) || WEXITSTATUS(status) != 0) throw std::runtime_error("Market data error");
  return out;
#endif
}

std::string http_get(const std::string& url) {
  return curl_io({"-sS", "--max-time", "20", "-A", UA, "-H", "Accept: application/json", url}, nullptr);
}

std::string http_post(const std::string& url, const std::string& body, const std::vector<std::string>& extra) {
  std::vector<std::string> args = {"-sS", "--max-time", "30", "-A", UA, "-H", "Content-Type: application/json", "-d", "@-"};
  args.insert(args.end(), extra.begin(), extra.end());
  args.push_back(url);
  return curl_io(args, &body);
}

struct Candle {
  long long t = 0;
  double o = 0, h = 0, l = 0, c = 0, v = 0;
};

struct Quote {
  std::string symbol, name, currency, exchange;
  double price = 0, previousClose = 0, change = 0, changePct = 0;
  bool has_open = false, has_high = false, has_low = false, has_volume = false, has_high52 = false, has_low52 = false;
  double open = 0, high = 0, low = 0, volume = 0, high52 = 0, low52 = 0;
};

std::string opt_num(bool has, double v) { return has ? fmt_num(v) : "null"; }

std::string quote_json(const Quote& q) {
  std::ostringstream o;
  o << "{\"symbol\":" << quote_str(q.symbol) << ",\"name\":" << quote_str(q.name)
    << ",\"currency\":" << quote_str(q.currency) << ",\"exchange\":" << quote_str(q.exchange)
    << ",\"price\":" << fmt_num(q.price) << ",\"previousClose\":" << fmt_num(q.previousClose)
    << ",\"change\":" << fmt_num(q.change) << ",\"changePct\":" << fmt_num(q.changePct)
    << ",\"open\":" << opt_num(q.has_open, q.open) << ",\"high\":" << opt_num(q.has_high, q.high)
    << ",\"low\":" << opt_num(q.has_low, q.low) << ",\"volume\":" << opt_num(q.has_volume, q.volume)
    << ",\"high52\":" << opt_num(q.has_high52, q.high52) << ",\"low52\":" << opt_num(q.has_low52, q.low52)
    << "}";
  return o.str();
}

std::string candles_json(const std::vector<Candle>& cs) {
  std::ostringstream o;
  o << "[";
  for (size_t i = 0; i < cs.size(); i++) {
    if (i) o << ",";
    const auto& c = cs[i];
    o << "{\"t\":" << c.t << ",\"o\":" << fmt_num(c.o) << ",\"h\":" << fmt_num(c.h) << ",\"l\":" << fmt_num(c.l)
      << ",\"c\":" << fmt_num(c.c) << ",\"v\":" << fmt_num(c.v) << "}";
  }
  o << "]";
  return o.str();
}

std::pair<Quote, std::vector<Candle>> parse_chart(const std::string& raw, const std::string& symbol) {
  Json root;
  try {
    root = Parser(raw).parse();
  } catch (const std::exception&) {
    throw std::runtime_error("No data for " + symbol);
  }
  const Json* chart = field(&root, "chart");
  const Json* result = at(field(chart, "result"), 0);
  if (!result) {
    std::string why = as_string(field(field(chart, "error"), "description"));
    throw std::runtime_error(why.empty() ? "No data for " + symbol : why);
  }
  const Json* meta = field(result, "meta");
  const Json* ts = field(result, "timestamp");
  const Json* quote0 = at(field(field(result, "indicators"), "quote"), 0);
  const Json* adj = field(at(field(field(result, "indicators"), "adjclose"), 0), "adjclose");
  const Json* opens = field(quote0, "open");
  const Json* highs = field(quote0, "high");
  const Json* lows = field(quote0, "low");
  const Json* closes = field(quote0, "close");
  const Json* vols = field(quote0, "volume");
  std::vector<Candle> candles;
  size_t n = ts && ts->type == Json::ARR ? ts->arr.size() : 0;
  for (size_t i = 0; i < n; i++) {
    double c = 0;
    bool ok = as_number(at(adj, i), c);
    if (!ok) ok = as_number(at(closes, i), c);
    if (!ok) continue;
    Candle candle;
    double t = 0;
    as_number(at(ts, i), t);
    candle.t = static_cast<long long>(t) * 1000;
    double o = c, h = c, l = c, v = 0;
    as_number(at(opens, i), o);
    as_number(at(highs, i), h);
    as_number(at(lows, i), l);
    as_number(at(vols, i), v);
    candle.o = o;
    candle.h = h;
    candle.l = l;
    candle.c = c;
    candle.v = v;
    candles.push_back(candle);
  }
  Quote q;
  q.symbol = as_string(field(meta, "symbol"), symbol);
  q.name = as_string(field(meta, "longName"));
  if (q.name.empty()) q.name = as_string(field(meta, "shortName"), symbol);
  q.currency = as_string(field(meta, "currency"), "USD");
  q.exchange = as_string(field(meta, "fullExchangeName"));
  if (q.exchange.empty()) q.exchange = as_string(field(meta, "exchangeName"));
  double price = 0;
  if (!as_number(field(meta, "regularMarketPrice"), price)) price = candles.empty() ? 0 : candles.back().c;
  q.price = price;
  double changePctRaw = 0;
  as_number(field(meta, "regularMarketChangePercent"), changePctRaw);
  q.changePct = changePctRaw / 100.0;
  if (std::isfinite(q.changePct) && q.changePct > -0.95) q.previousClose = price / (1.0 + q.changePct);
  else q.previousClose = candles.size() >= 2 ? candles[candles.size() - 2].c : price;
  q.change = price - q.previousClose;
  if (!candles.empty()) {
    q.has_open = true;
    q.open = candles.back().o;
  }
  double dayHigh = 0, dayLow = 0, vol = 0, hi52 = 0, lo52 = 0;
  if (as_number(field(meta, "regularMarketDayHigh"), dayHigh) && dayHigh != 0) {
    q.has_high = true;
    q.high = dayHigh;
  } else if (!candles.empty() && candles.back().h != 0) {
    q.has_high = true;
    q.high = candles.back().h;
  }
  if (as_number(field(meta, "regularMarketDayLow"), dayLow) && dayLow != 0) {
    q.has_low = true;
    q.low = dayLow;
  } else if (!candles.empty() && candles.back().l != 0) {
    q.has_low = true;
    q.low = candles.back().l;
  }
  if (as_number(field(meta, "regularMarketVolume"), vol) && vol != 0) {
    q.has_volume = true;
    q.volume = vol;
  }
  if (as_number(field(meta, "fiftyTwoWeekHigh"), hi52) && hi52 != 0) {
    q.has_high52 = true;
    q.high52 = hi52;
  }
  if (as_number(field(meta, "fiftyTwoWeekLow"), lo52) && lo52 != 0) {
    q.has_low52 = true;
    q.low52 = lo52;
  }
  return {q, candles};
}

std::string bundle_json(const Quote& q, const std::vector<Candle>& cs) {
  return "{\"quote\":" + quote_json(q) + ",\"candles\":" + candles_json(cs) + "}";
}

struct RangeSpec {
  const char* range;
  const char* interval;
};

RangeSpec range_spec(const std::string& range) {
  if (range == "1D") return {"1d", "5m"};
  if (range == "1W") return {"5d", "15m"};
  if (range == "3M") return {"3mo", "1d"};
  if (range == "1Y") return {"1y", "1d"};
  return {"1mo", "1d"};
}

std::string chart_url(const std::string& symbol, const char* range, const char* interval) {
  return "https://query1.finance.yahoo.com/v8/finance/chart/" + url_encode(symbol) + "?range=" + range +
         "&interval=" + interval + "&includePrePost=false";
}

std::string do_quote(const Json& body) {
  std::string symbol = upper_trim(as_string(field(&body, "symbol")));
  if (!valid_symbol(symbol)) throw std::runtime_error("Enter a valid ticker (letters, numbers, dots).");
  auto parsed = parse_chart(http_get(chart_url(symbol, "1y", "1d")), symbol);
  return bundle_json(parsed.first, parsed.second);
}

std::string do_chart(const Json& body) {
  std::string symbol = upper_trim(as_string(field(&body, "symbol")));
  if (!valid_symbol(symbol)) throw std::runtime_error("Enter a valid ticker (letters, numbers, dots).");
  std::string range = as_string(field(&body, "range"), "1M");
  auto spec = range_spec(range);
  try {
    auto parsed = parse_chart(http_get(chart_url(symbol, spec.range, spec.interval)), symbol);
    return bundle_json(parsed.first, parsed.second);
  } catch (const std::exception&) {
    if (range != "1D") throw;
    auto parsed = parse_chart(http_get(chart_url(symbol, "1d", "15m")), symbol);
    return bundle_json(parsed.first, parsed.second);
  }
}

std::string do_charts(const Json& body) {
  std::string range = as_string(field(&body, "range"), "3M");
  auto spec = range_spec(range);
  const Json* symbols = field(&body, "symbols");
  std::vector<std::string> list;
  if (symbols && symbols->type == Json::ARR) {
    for (const auto& item : symbols->arr) {
      std::string s = upper_trim(as_string(&item));
      if (!valid_symbol(s)) continue;
      bool seen = false;
      for (const auto& e : list)
        if (e == s) seen = true;
      if (!seen) list.push_back(s);
      if (list.size() == 4) break;
    }
  }
  std::string out = "[";
  bool first = true;
  for (const auto& symbol : list) {
    try {
      auto parsed = parse_chart(http_get(chart_url(symbol, spec.range, spec.interval)), symbol);
      if (!first) out += ",";
      first = false;
      out += bundle_json(parsed.first, parsed.second);
    } catch (...) {
    }
  }
  out += "]";
  return out;
}

std::string do_overview() {
  struct Idx {
    const char* symbol;
    const char* label;
  };
  const Idx indexes[] = {{"^GSPC", "S&P 500"}, {"^DJI", "Dow"}, {"^IXIC", "Nasdaq"}, {"^RUT", "Russell 2000"}, {"^VIX", "VIX"}};
  std::string out = "[";
  bool first = true;
  for (const auto& idx : indexes) {
    try {
      auto parsed = parse_chart(http_get(chart_url(idx.symbol, "5d", "1d")), idx.symbol);
      if (!first) out += ",";
      first = false;
      std::string q = quote_json(parsed.first);
      q.pop_back();
      out += q + ",\"label\":" + quote_str(idx.label) + "}";
    } catch (...) {
    }
  }
  out += "]";
  return out;
}

std::string news_thumb(const Json* n) {
  const Json* res = at(field(field(n, "thumbnail"), "resolutions"), 0);
  return as_string(field(res, "url"));
}

std::string news_item_json(const Json& n) {
  std::string id = as_string(field(&n, "uuid"));
  if (id.empty()) id = as_string(field(&n, "title"), "news");
  std::string link = as_string(field(&n, "link"));
  if (link.empty()) link = as_string(field(&n, "url"), "#");
  double published = 0;
  as_number(field(&n, "providerPublishTime"), published);
  std::string thumb = news_thumb(&n);
  std::ostringstream news;
  news << "{\"id\":" << quote_str(id) << ",\"title\":" << quote_str(as_string(field(&n, "title"), "Untitled"))
       << ",\"publisher\":" << quote_str(as_string(field(&n, "publisher"), "News")) << ",\"url\":" << quote_str(link)
       << ",\"published\":" << static_cast<long long>(published) * 1000;
  if (!thumb.empty()) news << ",\"thumbnail\":" << quote_str(thumb);
  news << "}";
  return news.str();
}

std::string do_headlines() {
  const char* queries[] = {"stocks", "earnings", "markets"};
  struct Item {
    long long published;
    std::string id;
    std::string json;
  };
  std::vector<Item> items;
  for (const char* q : queries) {
    try {
      std::string raw = http_get(std::string("https://query1.finance.yahoo.com/v1/finance/search?q=") + q +
                                 "&quotesCount=0&newsCount=20");
      Json root = Parser(raw).parse();
      const Json* narr = field(&root, "news");
      if (!narr || narr->type != Json::ARR) continue;
      for (const auto& n : narr->arr) {
        std::string id = as_string(field(&n, "uuid"));
        if (id.empty()) id = as_string(field(&n, "title"));
        if (id.empty()) continue;
        bool seen = false;
        for (const auto& have : items)
          if (have.id == id) seen = true;
        if (seen) continue;
        double published = 0;
        as_number(field(&n, "providerPublishTime"), published);
        items.push_back({static_cast<long long>(published), id, news_item_json(n)});
        if (items.size() >= 30) break;
      }
    } catch (...) {
    }
    if (items.size() >= 30) break;
  }
  std::sort(items.begin(), items.end(), [](const Item& a, const Item& b) { return a.published > b.published; });
  std::string out = "{\"news\":[";
  for (size_t i = 0; i < items.size(); i++) {
    if (i) out += ",";
    out += items[i].json;
  }
  out += "]}";
  return out;
}

std::string do_search(const Json& body) {
  std::string q = as_string(field(&body, "q"));
  size_t a = 0;
  while (a < q.size() && isspace(static_cast<unsigned char>(q[a]))) a++;
  size_t b = q.size();
  while (b > a && isspace(static_cast<unsigned char>(q[b - 1]))) b--;
  q = q.substr(a, b - a);
  if (q.empty()) return "{\"quotes\":[],\"news\":[]}";
  std::string raw = http_get("https://query1.finance.yahoo.com/v1/finance/search?q=" + url_encode(q) +
                             "&quotesCount=8&newsCount=12");
  Json root = Parser(raw).parse();
  std::ostringstream quotes;
  quotes << "[";
  bool first = true;
  const Json* qarr = field(&root, "quotes");
  if (qarr && qarr->type == Json::ARR) {
    for (const auto& item : qarr->arr) {
      if (as_string(field(&item, "symbol")).empty()) continue;
      if (!first) quotes << ",";
      first = false;
      std::string sector = as_string(field(&item, "sector"));
      std::string industry = as_string(field(&item, "industry"));
      quotes << "{\"symbol\":" << quote_str(as_string(field(&item, "symbol")))
             << ",\"name\":" << quote_str(as_string(field(&item, "longname"), as_string(field(&item, "shortname"), as_string(field(&item, "symbol")))))
             << ",\"type\":" << quote_str(as_string(field(&item, "typeDisp"), as_string(field(&item, "quoteType"), "Equity")))
             << ",\"exchange\":" << quote_str(as_string(field(&item, "exchDisp"), as_string(field(&item, "exchange"))));
      if (!sector.empty()) quotes << ",\"sector\":" << quote_str(sector);
      if (!industry.empty()) quotes << ",\"industry\":" << quote_str(industry);
      quotes << "}";
    }
  }
  quotes << "]";
  std::ostringstream news;
  news << "[";
  first = true;
  const Json* narr = field(&root, "news");
  if (narr && narr->type == Json::ARR) {
    for (const auto& n : narr->arr) {
      if (!first) news << ",";
      first = false;
      std::string id = as_string(field(&n, "uuid"));
      if (id.empty()) id = as_string(field(&n, "title"), "news");
      std::string link = as_string(field(&n, "link"));
      if (link.empty()) link = as_string(field(&n, "url"), "#");
      double published = 0;
      as_number(field(&n, "providerPublishTime"), published);
      std::string thumb = news_thumb(&n);
      news << "{\"id\":" << quote_str(id) << ",\"title\":" << quote_str(as_string(field(&n, "title"), "Untitled"))
           << ",\"publisher\":" << quote_str(as_string(field(&n, "publisher"), "News")) << ",\"url\":" << quote_str(link)
           << ",\"published\":" << static_cast<long long>(published) * 1000;
      if (!thumb.empty()) news << ",\"thumbnail\":" << quote_str(thumb);
      news << "}";
    }
  }
  news << "]";
  return "{\"quotes\":" + quotes.str() + ",\"news\":" + news.str() + "}";
}

std::string wiki_name(std::string name) {
  auto ends = [&](const std::string& suf) {
    if (name.size() < suf.size()) return false;
    for (size_t i = 0; i < suf.size(); i++) {
      char a = static_cast<char>(tolower(static_cast<unsigned char>(name[name.size() - suf.size() + i])));
      char b = static_cast<char>(tolower(static_cast<unsigned char>(suf[i])));
      if (a != b) return false;
    }
    return true;
  };
  const char* suffixes[] = {" inc.", " corp.", " corporation", " ltd.", " plc", " co."};
  for (const char* suf : suffixes) {
    if (ends(suf)) {
      name.resize(name.size() - strlen(suf));
      if (!name.empty() && name.back() == ',') name.pop_back();
      break;
    }
  }
  return name;
}

std::string do_profile(const Json& body) {
  std::string symbol = upper_trim(as_string(field(&body, "symbol")));
  if (!valid_symbol(symbol)) throw std::runtime_error("Enter a valid ticker (letters, numbers, dots).");
  std::string search_raw = http_get("https://query1.finance.yahoo.com/v1/finance/search?q=" + url_encode(symbol) +
                                    "&quotesCount=5&newsCount=0");
  auto parsed = parse_chart(http_get(chart_url(symbol, "5d", "1d")), symbol);
  Json search = Parser(search_raw).parse();
  const Json* hit = nullptr;
  const Json* quotes = field(&search, "quotes");
  if (quotes && quotes->type == Json::ARR) {
    for (const auto& item : quotes->arr) {
      if (upper_trim(as_string(field(&item, "symbol"))) == symbol) {
        hit = &item;
        break;
      }
    }
    if (!hit && !quotes->arr.empty()) hit = &quotes->arr[0];
  }
  std::string summary, wiki;
  try {
    std::string raw = http_get("https://en.wikipedia.org/api/rest_v1/page/summary/" + url_encode(wiki_name(parsed.first.name)));
    Json page = Parser(raw).parse();
    if (as_string(field(&page, "type")) != "disambiguation") {
      summary = as_string(field(&page, "extract"));
      wiki = as_string(field(field(field(&page, "content_urls"), "desktop"), "page"));
    }
  } catch (...) {
  }
  std::ostringstream o;
  o << "{\"symbol\":" << quote_str(parsed.first.symbol) << ",\"name\":" << quote_str(parsed.first.name)
    << ",\"exchange\":" << quote_str(parsed.first.exchange) << ",\"currency\":" << quote_str(parsed.first.currency)
    << ",\"type\":" << quote_str(as_string(field(hit, "typeDisp"), as_string(field(hit, "quoteType"), "Equity")));
  std::string sector = as_string(field(hit, "sector"));
  std::string industry = as_string(field(hit, "industry"));
  if (!sector.empty()) o << ",\"sector\":" << quote_str(sector);
  if (!industry.empty()) o << ",\"industry\":" << quote_str(industry);
  if (!summary.empty()) o << ",\"summary\":" << quote_str(summary);
  if (!wiki.empty()) o << ",\"wikiUrl\":" << quote_str(wiki);
  o << "}";
  return o.str();
}

std::string do_watch(const Json& body) {
  const Json* symbols = field(&body, "symbols");
  std::vector<std::string> list;
  if (symbols && symbols->type == Json::ARR) {
    for (const auto& item : symbols->arr) {
      std::string s = upper_trim(as_string(&item));
      if (!valid_symbol(s)) continue;
      bool seen = false;
      for (const auto& e : list)
        if (e == s) seen = true;
      if (!seen) list.push_back(s);
      if (list.size() == 24) break;
    }
  }
  std::string out = "[";
  bool first = true;
  for (const auto& symbol : list) {
    try {
      auto parsed = parse_chart(http_get(chart_url(symbol, "5d", "1d")), symbol);
      if (!first) out += ",";
      first = false;
      out += quote_json(parsed.first);
    } catch (...) {
    }
  }
  out += "]";
  return out;
}

std::string do_explain(const std::string& raw_body) {
  const char* key = getenv("XAI_API_KEY");
  if (!key || !*key) return "{\"ok\":false,\"error\":\"AI briefing is not available here.\"}";
  std::string payload =
      std::string("{\"model\":\"grok-4.5\",\"max_tokens\":280,\"temperature\":0.4,\"messages\":[") +
      "{\"role\":\"system\",\"content\":\"You are a markets desk analyst. Explain a technical ensemble forecast in 2 short paragraphs plus 3 bullets. Be precise, skeptical, and never give personalized investment advice. Mention this is a statistical sketch, not a guarantee.\"}," +
      "{\"role\":\"user\",\"content\":" + quote_str(raw_body) + "}]}";
  std::string auth = std::string("Authorization: Bearer ") + key;
  std::string raw;
  try {
    raw = http_post("https://api.x.ai/v1/chat/completions", payload, {"-H", auth});
  } catch (...) {
    return "{\"ok\":false,\"error\":\"Briefing failed\"}";
  }
  try {
    Json body = Parser(raw).parse();
    std::string text = as_string(field(field(at(field(&body, "choices"), 0), "message"), "content"));
    if (text.empty() && field(&body, "error")) return "{\"ok\":false,\"error\":\"Briefing failed\"}";
    return "{\"ok\":true,\"text\":" + quote_str(text) + "}";
  } catch (...) {
    return "{\"ok\":false,\"error\":\"Briefing failed\"}";
  }
}

std::string fixed2(double x) {
  char buf[64];
  snprintf(buf, sizeof(buf), "%.2f", x);
  return buf;
}

std::string fixed0(double x) {
  char buf[64];
  snprintf(buf, sizeof(buf), "%.0f", x);
  return buf;
}

double clampd(double n, double a, double b) { return std::min(b, std::max(a, n)); }

double mean_of(const std::vector<double>& xs) {
  double s = 0;
  for (double x : xs) s += x;
  return xs.empty() ? 0 : s / static_cast<double>(xs.size());
}

double stdev_of(const std::vector<double>& xs) {
  if (xs.size() < 2) return 0;
  double m = mean_of(xs);
  double v = 0;
  for (double x : xs) v += (x - m) * (x - m);
  return std::sqrt(v / static_cast<double>(xs.size() - 1));
}

double sma_at(const std::vector<double>& xs, int n) {
  if (static_cast<int>(xs.size()) < n) return nan("");
  double s = 0;
  for (size_t i = xs.size() - static_cast<size_t>(n); i < xs.size(); i++) s += xs[i];
  return s / n;
}

std::vector<double> ema_series(const std::vector<double>& xs, int n) {
  double k = 2.0 / (n + 1.0);
  std::vector<double> out;
  double e = 0;
  for (size_t i = 0; i < xs.size(); i++) {
    e = i == 0 ? xs[0] : xs[i] * k + e * (1.0 - k);
    out.push_back(e);
  }
  return out;
}

double rsi_of(const std::vector<double>& xs, int n = 14) {
  if (static_cast<int>(xs.size()) < n + 1) return nan("");
  double gains = 0, losses = 0;
  size_t start = xs.size() - static_cast<size_t>(n);
  for (size_t i = start; i < xs.size(); i++) {
    double d = xs[i] - xs[i - 1];
    if (d >= 0) gains += d;
    else losses -= d;
  }
  double al = losses / n;
  if (al == 0) return 100;
  double rs = (gains / n) / al;
  return 100.0 - 100.0 / (1.0 + rs);
}

struct Line {
  double slope = 0, intercept = 0, r2 = 0;
};

Line linreg(const std::vector<double>& xs) {
  int n = static_cast<int>(xs.size());
  Line line;
  if (n < 3) {
    line.intercept = xs.empty() ? 0 : xs[0];
    return line;
  }
  double sx = 0, sy = 0, sxy = 0, sx2 = 0;
  for (int i = 0; i < n; i++) {
    sx += i;
    sy += xs[i];
    sxy += i * xs[i];
    sx2 += i * static_cast<double>(i);
  }
  double den = n * sx2 - sx * sx;
  line.slope = den == 0 ? 0 : (n * sxy - sx * sy) / den;
  line.intercept = (sy - line.slope * sx) / n;
  double y_mean = sy / n;
  double ss_tot = 0, ss_res = 0;
  for (int i = 0; i < n; i++) {
    double yhat = line.intercept + line.slope * i;
    ss_tot += (xs[i] - y_mean) * (xs[i] - y_mean);
    ss_res += (xs[i] - yhat) * (xs[i] - yhat);
  }
  line.r2 = ss_tot == 0 ? 0 : std::max(0.0, 1.0 - ss_res / ss_tot);
  return line;
}

std::string opt_double(double x) { return std::isfinite(x) ? fmt_num(x) : "null"; }

std::string do_forecast(const Json& body) {
  const Json* candles = field(&body, "candles");
  std::vector<double> closes, volumes;
  if (candles && candles->type == Json::ARR) {
    for (const auto& c : candles->arr) {
      if (closes.size() >= 2000) break;
      double close = 0;
      if (!as_number(field(&c, "c"), close) || !std::isfinite(close) || close <= 0) continue;
      double vol = 0;
      as_number(field(&c, "v"), vol);
      closes.push_back(close);
      volumes.push_back(std::isfinite(vol) ? vol : 0);
    }
  }
  if (closes.size() < 40) return "null";
  double horizon = 7;
  as_number(field(&body, "horizon"), horizon);
  int days = static_cast<int>(horizon);
  if (days < 1) days = 1;
  if (days > 30) days = 30;
  double last_close = closes.back();
  std::vector<double> window(closes.end() - std::min<size_t>(60, closes.size()), closes.end());
  Line trend = linreg(window);
  double sma20 = sma_at(closes, 20);
  double sma50 = sma_at(closes, 50);
  auto ema12s = ema_series(closes, 12);
  auto ema26s = ema_series(closes, 26);
  double ema12 = ema12s.back();
  double ema26 = ema26s.back();
  std::vector<double> macd_line;
  for (size_t i = 0; i < ema12s.size(); i++) macd_line.push_back(ema12s[i] - ema26s[i]);
  size_t macd_from = macd_line.size() > 40 ? macd_line.size() - 40 : 0;
  std::vector<double> macd_tail(macd_line.begin() + static_cast<long>(macd_from), macd_line.end());
  auto signal = ema_series(macd_tail, 9);
  double macd = macd_line.back();
  double macd_signal = signal.empty() ? macd : signal.back();
  double rsi14 = rsi_of(closes, 14);
  std::vector<double> recent(closes.end() - std::min<size_t>(20, closes.size()), closes.end());
  double mid = mean_of(recent);
  double sd = stdev_of(recent);
  double bb_upper = mid + 2 * sd;
  double bb_lower = mid - 2 * sd;
  double mom10 = closes.size() > 10 ? last_close / closes[closes.size() - 11] - 1 : 0;
  std::vector<double> vol20v(volumes.end() - std::min<size_t>(20, volumes.size()), volumes.end());
  std::vector<double> vol5v(volumes.end() - std::min<size_t>(5, volumes.size()), volumes.end());
  double vol20 = mean_of(vol20v);
  double vol5 = mean_of(vol5v);
  double volume_ratio = vol20 > 0 ? vol5 / vol20 : 1;

  struct Vote { std::string name, note; double score; };
  std::vector<Vote> votes;
  double trend_score = clampd((trend.slope / last_close) * 40, -1, 1);
  votes.push_back({"Linear trend (60d)",
                   trend.slope >= 0 ? "Upward drift " + fixed2((trend.slope / last_close) * 100) + "% per session"
                                    : "Downward drift " + fixed2((trend.slope / last_close) * 100) + "% per session",
                   trend_score});
  double ema_score = clampd((ema12 - ema26) / last_close * 25, -1, 1);
  votes.push_back({"EMA 12/26 momentum", ema12 >= ema26 ? "Short EMA above long EMA" : "Short EMA below long EMA", ema_score});
  double macd_score = clampd((macd - macd_signal) / last_close * 80, -1, 1);
  votes.push_back({"MACD histogram", macd >= macd_signal ? "MACD above signal" : "MACD below signal", macd_score});
  double rsi_score = 0;
  std::string rsi_note = "Insufficient history";
  if (std::isfinite(rsi14)) {
    if (rsi14 >= 70) rsi_score = -0.7 - (rsi14 - 70) / 60;
    else if (rsi14 <= 30) rsi_score = 0.7 + (30 - rsi14) / 60;
    else rsi_score = (50 - rsi14) / 50;
    rsi_score = clampd(rsi_score, -1, 1);
    rsi_note = rsi14 >= 70 ? "Overbought (" + fixed0(rsi14) + ")"
             : rsi14 <= 30 ? "Oversold (" + fixed0(rsi14) + ")"
                           : "Neutral RSI " + fixed0(rsi14);
  }
  votes.push_back({"RSI mean-reversion", rsi_note, rsi_score});
  double sma_score = 0;
  std::string sma_note = "Need 50 sessions";
  if (std::isfinite(sma20) && std::isfinite(sma50)) {
    sma_score = clampd((sma20 - sma50) / last_close * 12, -1, 1);
    sma_score += last_close > sma20 ? 0.15 : -0.15;
    sma_score = clampd(sma_score, -1, 1);
    std::string regime = sma20 >= sma50 ? "SMA20 above SMA50" : "SMA20 below SMA50";
    std::string vs = last_close >= sma20 ? "price above SMA20" : "price below SMA20";
    sma_note = regime + "; " + vs;
  }
  votes.push_back({"SMA 20/50 regime", sma_note, sma_score});
  double bb_pos = sd > 0 ? (last_close - mid) / (2 * sd) : 0;
  votes.push_back({"Bollinger pull",
                   bb_pos > 0.8 ? "Near upper band — fade bias" : bb_pos < -0.8 ? "Near lower band — bounce bias" : "Inside the envelope",
                   clampd(-bb_pos * 0.8, -1, 1)});
  votes.push_back({"10-day momentum", "10-session return " + fixed2(mom10 * 100) + "%", clampd(mom10 * 8, -1, 1)});

  const double weights[] = {0.22, 0.16, 0.14, 0.14, 0.14, 0.1, 0.1};
  double blended = 0;
  for (size_t i = 0; i < votes.size(); i++) blended += votes[i].score * weights[i];
  blended *= volume_ratio >= 1 ? 1.05 : 0.95;
  blended = clampd(blended, -1, 1);
  double expected = clampd(blended * 0.008 + (trend.slope / last_close) * 0.25, -0.035, 0.035);
  std::ostringstream path;
  path << "[";
  double next_close = last_close;
  for (int d = 1; d <= days; d++) {
    double fade = 1 - d * 0.04;
    double price = last_close * (1 + expected * fade * d);
    if (d == 1) next_close = price;
    if (d > 1) path << ",";
    path << "{\"day\":" << d << ",\"price\":" << fmt_num(price) << "}";
  }
  path << "]";
  std::string direction = expected > 0.0008 ? "bullish" : expected < -0.0008 ? "bearish" : "neutral";
  int agree = 0;
  for (const auto& v : votes) {
    if (direction == "bullish" ? v.score > 0.05 : direction == "bearish" ? v.score < -0.05 : std::fabs(v.score) < 0.2) agree++;
  }
  double confidence = clampd(0.28 + trend.r2 * 0.35 + (static_cast<double>(agree) / votes.size()) * 0.32, 0.22, 0.86);

  int lookback = 40;
  int start = std::max(lookback, static_cast<int>(closes.size()) - 40);
  int hits = 0, n = 0;
  double ape = 0;
  for (int i = start; i < static_cast<int>(closes.size()) - 1; i++) {
    std::vector<double> w(closes.begin() + (i - lookback), closes.begin() + i);
    Line line = linreg(w);
    double last = w.back();
    double pred = last + line.slope;
    double actual = closes[i];
    double pred_dir = pred - last;
    double act_dir = actual - last;
    if ((pred_dir == 0 && act_dir == 0) || pred_dir * act_dir > 0) hits++;
    ape += std::fabs(actual - pred) / actual;
    n++;
  }

  std::ostringstream votes_json;
  votes_json << "[";
  for (size_t i = 0; i < votes.size(); i++) {
    if (i) votes_json << ",";
    votes_json << "{\"name\":" << quote_str(votes[i].name) << ",\"score\":" << fmt_num(votes[i].score)
               << ",\"note\":" << quote_str(votes[i].note) << "}";
  }
  votes_json << "]";
  std::ostringstream out;
  out << "{\"lastClose\":" << fmt_num(last_close) << ",\"nextClose\":" << fmt_num(next_close)
      << ",\"expectedDailyReturn\":" << fmt_num(expected) << ",\"direction\":" << quote_str(direction)
      << ",\"confidence\":" << fmt_num(confidence) << ",\"path\":" << path.str() << ",\"votes\":" << votes_json.str()
      << ",\"rsi14\":" << opt_double(rsi14) << ",\"sma20\":" << opt_double(sma20) << ",\"sma50\":" << opt_double(sma50)
      << ",\"ema12\":" << fmt_num(ema12) << ",\"ema26\":" << fmt_num(ema26) << ",\"macd\":" << fmt_num(macd)
      << ",\"bbUpper\":" << fmt_num(bb_upper) << ",\"bbLower\":" << fmt_num(bb_lower) << ",\"slope\":" << fmt_num(trend.slope)
      << ",\"r2\":" << fmt_num(trend.r2) << ",\"backtest\":{\"samples\":" << n
      << ",\"directionalAccuracy\":" << fmt_num(n ? static_cast<double>(hits) / n : 0) << ",\"mape\":" << fmt_num(n ? ape / n : 0)
      << "}}";
  return out.str();
}

std::string do_pnl(const Json& body) {
  double quantity = 0, buy = 0, current = 0, projected = 0, target = 0;
  if (!as_number(field(&body, "quantity"), quantity) || !(quantity > 0)) return "null";
  if (!as_number(field(&body, "buyPrice"), buy) || buy < 0) return "null";
  if (!as_number(field(&body, "currentPrice"), current) || !as_number(field(&body, "projectedPrice"), projected)) return "null";
  if (!std::isfinite(current) || !std::isfinite(projected)) return "null";
  bool has_target = as_number(field(&body, "targetPrice"), target) && std::isfinite(target) && target > 0;
  double cost = quantity * buy;
  double current_value = quantity * current;
  double projected_value = quantity * projected;
  double current_pnl = current_value - cost;
  double projected_pnl = projected_value - cost;
  auto pct = [&](double pnl) { return cost > 0 ? pnl / cost : 0; };
  std::ostringstream o;
  o << "{\"cost\":" << fmt_num(cost) << ",\"currentValue\":" << fmt_num(current_value)
    << ",\"currentPnl\":" << fmt_num(current_pnl) << ",\"currentPct\":" << fmt_num(pct(current_pnl))
    << ",\"projectedValue\":" << fmt_num(projected_value) << ",\"projectedPnl\":" << fmt_num(projected_pnl)
    << ",\"projectedPct\":" << fmt_num(pct(projected_pnl));
  if (has_target) {
    double target_value = quantity * target;
    o << ",\"targetValue\":" << fmt_num(target_value) << ",\"targetPnl\":" << fmt_num(target_value - cost)
      << ",\"targetPct\":" << fmt_num(pct(target_value - cost));
  } else {
    o << ",\"targetValue\":null,\"targetPnl\":null,\"targetPct\":null";
  }
  o << ",\"breakEven\":" << fmt_num(buy) << ",\"perShareNow\":" << fmt_num(current - buy)
    << ",\"perShareProjected\":" << fmt_num(projected - buy) << "}";
  return o.str();
}

std::string handle_path(const std::string& path, const std::string& raw) {
  if (path == "/health") return "{\"ok\":true}";
  Json body;
  if (!raw.empty()) body = Parser(raw).parse();
  if (path == "/quote") return do_quote(body);
  if (path == "/chart") return do_chart(body);
  if (path == "/charts") return do_charts(body);
  if (path == "/overview") return do_overview();
  if (path == "/search") return do_search(body);
  if (path == "/headlines") return do_headlines();
  if (path == "/profile") return do_profile(body);
  if (path == "/watch") return do_watch(body);
  if (path == "/forecast") return do_forecast(body);
  if (path == "/pnl") return do_pnl(body);
  if (path == "/explain") return do_explain(raw);
  throw std::runtime_error("Unknown route");
}

void write_all(socket_t fd, const std::string& s) {
  size_t off = 0;
  while (off < s.size()) {
    int chunk = static_cast<int>(std::min(s.size() - off, static_cast<size_t>(1 << 20)));
    int n = sock_send(fd, s.data() + off, chunk);
    if (n < 0) {
      if (errno == EINTR) continue;
      return;
    }
    off += static_cast<size_t>(n);
  }
}

void respond(socket_t fd, int status, const std::string& body) {
  const char* text = status == 200 ? "OK" : "Bad Request";
  std::ostringstream o;
  o << "HTTP/1.1 " << status << " " << text
    << "\r\nContent-Type: application/json\r\nContent-Length: " << body.size()
    << "\r\nConnection: close\r\n\r\n" << body;
  write_all(fd, o.str());
}

std::string read_http(socket_t fd, std::string& path) {
  std::string data;
  char buf[4096];
  while (data.find("\r\n\r\n") == std::string::npos) {
    int n = sock_recv(fd, buf, sizeof(buf));
    if (n < 0) {
      if (errno == EINTR) continue;
      break;
    }
    if (n == 0) break;
    data.append(buf, buf + n);
    if (data.size() > 2 * 1024 * 1024) break;
  }
  auto hdr_end = data.find("\r\n\r\n");
  if (hdr_end == std::string::npos) throw std::runtime_error("bad request");
  std::string head = data.substr(0, hdr_end);
  std::string body = data.substr(hdr_end + 4);
  auto line_end = head.find("\r\n");
  std::string req = head.substr(0, line_end);
  auto sp1 = req.find(' ');
  auto sp2 = req.find(' ', sp1 == std::string::npos ? 0 : sp1 + 1);
  if (sp1 == std::string::npos) throw std::runtime_error("bad request");
  path = req.substr(sp1 + 1, (sp2 == std::string::npos ? req.size() : sp2) - sp1 - 1);
  auto q = path.find('?');
  if (q != std::string::npos) path = path.substr(0, q);
  size_t length = 0;
  std::string lower = head;
  for (char& c : lower) c = static_cast<char>(tolower(static_cast<unsigned char>(c)));
  auto cl = lower.find("content-length:");
  if (cl != std::string::npos) length = static_cast<size_t>(strtoul(lower.c_str() + cl + 15, nullptr, 10));
  while (body.size() < length) {
    int n = sock_recv(fd, buf, sizeof(buf));
    if (n <= 0) break;
    body.append(buf, buf + n);
  }
  if (body.size() > length) body.resize(length);
  return body;
}

void serve_client(socket_t fd) {
  try {
    std::string path;
    std::string body = read_http(fd, path);
    if (path == "/health") {
      respond(fd, 200, "{\"ok\":true}");
      return;
    }
    std::string out = handle_path(path, body);
    respond(fd, 200, out);
  } catch (const std::exception& err) {
    respond(fd, 400, "{\"error\":" + quote_str(err.what()) + "}");
  }
}

}  // namespace

int main() {
#ifdef _WIN32
  WSADATA wsa{};
  if (WSAStartup(MAKEWORD(2, 2), &wsa) != 0) return 1;
#else
  signal(SIGCHLD, SIG_IGN);
  signal(SIGPIPE, SIG_IGN);
#endif
  socket_t srv = socket(AF_INET, SOCK_STREAM, 0);
  if (srv == kInvalid) return 1;
  int yes = 1;
  setsockopt(srv, SOL_SOCKET, SO_REUSEADDR, reinterpret_cast<const char*>(&yes), sizeof(yes));
  sockaddr_in addr{};
  addr.sin_family = AF_INET;
  addr.sin_port = htons(8091);
  inet_pton(AF_INET, "127.0.0.1", &addr.sin_addr);
  if (bind(srv, reinterpret_cast<sockaddr*>(&addr), sizeof(addr)) != 0) return 1;
  if (listen(srv, 64) != 0) return 1;
  while (true) {
    socket_t fd = accept(srv, nullptr, nullptr);
    if (fd == kInvalid) continue;
    std::thread([fd] {
      serve_client(fd);
      sock_close(fd);
    }).detach();
  }
}
