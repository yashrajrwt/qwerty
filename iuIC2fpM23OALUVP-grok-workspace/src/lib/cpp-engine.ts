export type CppConcept = {
  id: string;
  category: string;
  title: string;
  definition: string;
  explanation: string;
  analogy: string;
  nest: string;
  syntax: string;
  code: string;
  output: string;
  lines: string[];
  visual: string;
  mistakes: string;
  advantages: string;
  disadvantages: string;
};

export const CPP_CATEGORIES = [
  "OOP fundamentals",
  "Advanced OOP",
  "C++ programming",
  "Advanced C++",
] as const;

export const CPP_CONCEPTS: CppConcept[] = [
  {
    id: "classes",
    category: "OOP fundamentals",
    title: "Classes and objects",
    definition: "A class is a blueprint. An object is one real item built from that blueprint.",
    explanation:
      "The class names the data members and the member functions. Each object keeps its own copy of the data. Calling displayStock() on one object does not change another object. A constructor runs when the object is created and gives the members their first values.",
    analogy: "A stock ticket form is the class. The filled ticket for Apple, with its own price and share count, is the object.",
    nest: "A study model of one holding: name, ticker, price, quantity, and company. NestInvest’s live prices are fetched by the C++ market service. This class is a teaching model, not the web page.",
    syntax: "class Stock { public: void displayStock(); Stock(string symbol, double price); private: string symbol; double price; };",
    code: `#include <iostream>
#include <string>
class Stock {
 public:
  Stock(std::string name, std::string symbol, double price, int quantity, std::string company)
      : name_(name), symbol_(symbol), price_(price), quantity_(quantity), company_(company) {}
  void displayStock() const {
    std::cout << symbol_ << " " << name_ << " @ " << price_ << " x " << quantity_ << "\\n";
  }
  void updatePrice(double price) { price_ = price; }
  double calculateInvestment() const { return price_ * quantity_; }
  double calculateProfitLoss(double buy) const { return (price_ - buy) * quantity_; }
 private:
  std::string name_, symbol_, company_;
  double price_;
  int quantity_;
};
int main() {
  Stock apple("Apple", "AAPL", 190, 10, "Apple Inc.");
  apple.updatePrice(195);
  apple.displayStock();
  std::cout << apple.calculateInvestment() << " pnl " << apple.calculateProfitLoss(180) << "\\n";
}`,
    output: "AAPL Apple @ 195 x 10\n1950 pnl 150",
    lines: [
      "class Stock starts the blueprint.",
      "The constructor writes the first name, symbol, price, quantity, and company into the object.",
      "displayStock, updatePrice, calculateInvestment, and calculateProfitLoss are member functions.",
      "name_ and the other fields are data members. Each object has its own.",
      "Stock apple(...) creates one object.",
      "apple.updatePrice(195) changes only that object.",
    ],
    visual: "Stock blueprint → object apple (AAPL) and object msft (MSFT), each with its own price.",
    mistakes: "Forgetting to initialize price, or treating the class name as if it already holds a price.",
    advantages: "One definition is reused for every holding.",
    disadvantages: "A class that does too much becomes hard to change.",
  },
  {
    id: "encapsulation",
    category: "OOP fundamentals",
    title: "Encapsulation",
    definition: "Keep data private and change it only through functions that check the rules.",
    explanation:
      "Private members cannot be written from main(). Public getters and setters are the door. A setter can reject a negative deposit. That is data hiding: the account number and balance stay inside the object.",
    analogy: "A teller window. You ask for a withdrawal. You do not reach into the vault.",
    nest: "An InvestmentAccount study model protects the cash balance. The desk should not let a screen set a balance to a negative number by writing the field directly.",
    syntax: "class InvestmentAccount { public: double balance() const; void deposit(double); private: double balance_; };",
    code: `class InvestmentAccount {
 public:
  void deposit(double amount) {
    if (amount <= 0) return;
    balance_ += amount;
  }
  bool withdraw(double amount) {
    if (amount <= 0 || amount > balance_) return false;
    balance_ -= amount;
    return true;
  }
  double balance() const { return balance_; }
 private:
  std::string owner_;
  double balance_ = 0;
};`,
    output: "deposit 500 → balance 500\nwithdraw 900 → rejected\nbalance 500",
    lines: [
      "balance_ and owner_ are private.",
      "deposit and withdraw are the only ways to change the balance.",
      "balance() is a getter. It does not let the caller rewrite the field.",
      "A failed withdrawal leaves the private balance unchanged.",
    ],
    visual: "Outside code → public deposit/withdraw → private balance.",
    mistakes: "Making balance public, or a setter that accepts any number.",
    advantages: "Invalid balances are blocked in one place.",
    disadvantages: "Too many trivial getters add noise if they never check anything.",
  },
  {
    id: "abstraction",
    category: "OOP fundamentals",
    title: "Abstraction",
    definition: "Show the operations a caller needs and hide how they are done.",
    explanation:
      "An abstract class can declare pure virtual functions. Callers use fetchPrice() and displayMarketData() without knowing whether the number came from a network call or a cache. The derived class fills in the real work.",
    analogy: "A light switch. You flip it. You do not manage the power plant.",
    nest: "The desk asks for a price. The C++ market service does the fetch and parsing. The page does not see that work. MarketData below is a study model of that idea.",
    syntax: "class MarketData { public: virtual double fetchPrice() = 0; virtual ~MarketData() = default; };",
    code: `class MarketData {
 public:
  virtual double fetchPrice(const std::string& symbol) = 0;
  virtual void displayMarketData() const = 0;
  virtual ~MarketData() = default;
};
class LiveQuote : public MarketData {
 public:
  double fetchPrice(const std::string& symbol) override { return symbol == "AAPL" ? 190 : 0; }
  void displayMarketData() const override { std::cout << "live feed\\n"; }
};`,
    output: "LiveQuote q; q.fetchPrice(\"AAPL\") → 190\nMarketData alone cannot be created",
    lines: [
      "MarketData names the job and not the steps.",
      "= 0 makes the function pure virtual, so the class is abstract.",
      "LiveQuote must override both functions.",
      "The caller keeps a MarketData pointer and still gets LiveQuote’s price.",
    ],
    visual: "Caller → MarketData interface → LiveQuote or CachedQuote.",
    mistakes: "Leaving a pure virtual function unimplemented in the derived class.",
    advantages: "The caller stays stable when the feed changes.",
    disadvantages: "A vague interface hides the cost of a slow fetch.",
  },
  {
    id: "inheritance",
    category: "OOP fundamentals",
    title: "Inheritance",
    definition: "A derived class receives members from a base class and adds its own.",
    explanation:
      "Single inheritance: StockInvestment derives from Investment. Multilevel: BlueChip derives from StockInvestment, which derives from Investment. Hierarchical: Stock, MutualFund, and ETF all derive from Investment. Multiple: a class derives from two bases. Hybrid mixes hierarchical and multiple. Public inheritance means the public base members stay public in the derived class.",
    analogy: "Every vehicle has wheels. A delivery van adds a cargo door.",
    nest: "Investment can hold the shared cost and date. StockInvestment adds a ticker. MutualFundInvestment adds a NAV. ETFInvestment adds a basket name. These are study types, not extra products on the desk.",
    syntax: "class StockInvestment : public Investment { };",
    code: `class Investment { public: double cost = 0; };
class StockInvestment : public Investment { public: std::string symbol; };          // single
class BlueChip : public StockInvestment { public: bool dividend = true; };       // multilevel
class MutualFundInvestment : public Investment { public: double nav = 0; };      // hierarchical
class ETFInvestment : public Investment { public: std::string basket; };
class Report { public: std::string title; };
class AuditedFund : public MutualFundInvestment, public Report {};               // multiple, hybrid`,
    output: "BlueChip shares cost from Investment and symbol from StockInvestment\nAuditedFund has nav and title",
    lines: [
      "Single: one colon, one base.",
      "Multilevel: the grandchild receives both levels.",
      "Hierarchical: several classes share one base.",
      "Multiple: two bases on the colon list.",
      "Hybrid: AuditedFund sits in a hierarchy and also derives from Report.",
    ],
    visual: "Investment → Stock, Fund, ETF. Stock → BlueChip. Fund + Report → AuditedFund.",
    mistakes: "Two bases with the same member name, or inheriting just to reuse a few lines.",
    advantages: "Shared fields are written once.",
    disadvantages: "Deep trees are hard to follow. Multiple inheritance needs care.",
  },
  {
    id: "polymorphism",
    category: "OOP fundamentals",
    title: "Polymorphism",
    definition: "One name can do different work depending on the arguments or the real object.",
    explanation:
      "Compile-time polymorphism is function overloading and operator overloading. The compiler picks the function from the arguments. Runtime polymorphism needs a virtual function. The call goes to the derived override. A pure virtual function makes the base abstract.",
    analogy: "The word “return” means a tax form for a fund and a price change for a stock.",
    nest: "calculateReturn() can mean price change for a stock, NAV change for a fund, and tracking difference for an ETF. The study model uses one Investment pointer.",
    syntax: "virtual double calculateReturn() const = 0;",
    code: `class Investment {
 public:
  virtual double calculateReturn(double now, double then) const { return now - then; }
  virtual ~Investment() = default;
};
class StockInvestment : public Investment {
 public:
  double calculateReturn(double now, double then) const override { return (now - then) / then; }
};
class FundInvestment : public Investment {
 public:
  double calculateReturn(double now, double then) const override { return (now - then) / then * 0.5; }
};
void report(double a, double b) { std::cout << a + b << "\\n"; }
void report(double a) { std::cout << a << "\\n"; }  // overload`,
    output: "Stock 190 vs 180 → 0.0556\nFund 190 vs 180 → 0.0278\nreport(1, 2) picks the two-argument overload",
    lines: [
      "report is overloaded. The compiler chooses from the call.",
      "calculateReturn is virtual, so the object’s real type decides.",
      "override tells the compiler this function replaces the base one.",
      "A base pointer to a StockInvestment still runs the stock formula.",
    ],
    visual: "Investment* → Stock formula or Fund formula at run time.",
    mistakes: "Forgetting virtual, then the base function always runs. Slicing an object by copying it into a base value.",
    advantages: "New investment types can be added without rewriting the caller.",
    disadvantages: "Virtual calls are slightly less direct, and the flow is harder to see.",
  },
  {
    id: "constructors",
    category: "Advanced OOP",
    title: "Constructors",
    definition: "A constructor runs when an object is created and sets its starting state.",
    explanation:
      "A default constructor takes no arguments. A parameterized constructor takes the starting values. A copy constructor builds a new object from an existing one. Several constructors are constructor overloading. Member initializer lists set fields before the body runs.",
    analogy: "Opening a new account file and writing the first balance on the cover.",
    nest: "A Stock object can be born empty, born with a ticker and price, or copied when a lot is duplicated into a study portfolio.",
    syntax: "Stock(); Stock(std::string symbol, double price); Stock(const Stock& other);",
    code: `class Stock {
 public:
  Stock() : symbol_("—"), price_(0) { std::cout << "default\\n"; }
  Stock(std::string symbol, double price) : symbol_(symbol), price_(price) { std::cout << "parameterized\\n"; }
  Stock(const Stock& other) : symbol_(other.symbol_), price_(other.price_) { std::cout << "copy\\n"; }
 private:
  std::string symbol_;
  double price_;
};
Stock a;
Stock b("AAPL", 190);
Stock c = b;`,
    output: "default\nparameterized\ncopy",
    lines: [
      "Stock() is the default constructor.",
      "Stock(string, double) is parameterized.",
      "Stock(const Stock&) is the copy constructor.",
      "Three constructors with the same name are overloading.",
      "The initializer list sets symbol_ and price_ before the body.",
    ],
    visual: "new object → choose one constructor → members filled.",
    mistakes: "Using a copied object and assuming it is independent when a later pointer is shared.",
    advantages: "An object cannot be used half-initialized if every constructor sets the fields.",
    disadvantages: "Too many constructors are confusing. Defaults can hide a missing price.",
  },
  {
    id: "destructors",
    category: "Advanced OOP",
    title: "Destructors",
    definition: "A destructor runs when an object’s lifetime ends and releases what it owns.",
    explanation:
      "The name is ~ClassName. It takes no arguments and returns nothing. Local objects are destroyed at the end of the block, in reverse order of creation. A virtual destructor is required when deleting a derived object through a base pointer.",
    analogy: "Closing the account file and returning the folder to the shelf.",
    nest: "A study Portfolio that owns Stock objects on the heap must destroy them. The lesson is the order of the messages, not a change to the live desk.",
    syntax: "virtual ~Portfolio();",
    code: `class Stock {
 public:
  explicit Stock(std::string symbol) : symbol_(symbol) { std::cout << "born " << symbol_ << "\\n"; }
  ~Stock() { std::cout << "gone " << symbol_ << "\\n"; }
 private:
  std::string symbol_;
};
void demo() {
  Stock a("AAPL");
  Stock b("MSFT");
}`,
    output: "born AAPL\nborn MSFT\ngone MSFT\ngone AAPL",
    lines: [
      "The constructor prints when the object is created.",
      "The destructor prints when the object dies.",
      "b is created second, so it is destroyed first.",
      "Leaving demo() ends both lifetimes.",
    ],
    visual: "Enter block: AAPL then MSFT. Leave block: MSFT then AAPL.",
    mistakes: "A non-virtual destructor on a base that is deleted through a base pointer.",
    advantages: "Resources are released even when the function returns early.",
    disadvantages: "Doing heavy work in a destructor makes errors hard to report.",
  },
  {
    id: "virtual",
    category: "Advanced OOP",
    title: "Virtual functions",
    definition: "A virtual function lets the real object choose the function at run time.",
    explanation:
      "Mark the base function virtual. The derived class overrides it. A call through a base pointer or reference uses the derived function. Without virtual, the compiler binds the base function.",
    analogy: "The label says “close the position.” A stock desk and a fund desk close it in different ways.",
    nest: "A list of Investment pointers can print each return with one loop. Each object supplies its own function.",
    syntax: "virtual double calculateReturn() const; ... double calculateReturn() const override;",
    code: `class Investment { public: virtual std::string kind() const { return "investment"; } virtual ~Investment() = default; };
class StockInvestment : public Investment { public: std::string kind() const override { return "stock"; } };
Investment* p = new StockInvestment();
std::cout << p->kind();
delete p;`,
    output: "stock",
    lines: [
      "kind() is virtual in the base.",
      "StockInvestment overrides it.",
      "p’s static type is Investment*. Its dynamic type is StockInvestment.",
      "The call prints stock, not investment.",
      "delete uses the virtual destructor so the derived object is destroyed correctly.",
    ],
    visual: "Pointer type Investment. Object type Stock. Call lands on Stock.",
    mistakes: "Calling a virtual function from a constructor. The derived override is not active yet.",
    advantages: "One loop handles many investment types.",
    disadvantages: "The next function is not obvious from the pointer’s written type.",
  },
  {
    id: "pure-virtual",
    category: "Advanced OOP",
    title: "Pure virtual functions",
    definition: "A pure virtual function has no base body and must be overridden.",
    explanation:
      "The = 0 suffix means the base does not provide an implementation. A class with at least one pure virtual function is abstract. You cannot create an object of that class.",
    analogy: "A blank required field on a form. The form cannot be filed until the field is filled.",
    nest: "calculateReturn() can be required for every investment type so a half-finished type cannot be used on the study desk.",
    syntax: "virtual double calculateReturn() const = 0;",
    code: `class Investment {
 public:
  virtual double calculateReturn() const = 0;
  virtual ~Investment() = default;
};
class StockInvestment : public Investment {
 public:
  double calculateReturn() const override { return 0.04; }
};`,
    output: "Investment x;          // error, abstract class\nStockInvestment s; s.calculateReturn() → 0.04",
    lines: [
      "= 0 means there is no base formula.",
      "Investment cannot be constructed.",
      "StockInvestment supplies the missing function.",
      "The object is usable only after the override exists.",
    ],
    visual: "Investment is a hollow box. StockInvestment fills calculateReturn.",
    mistakes: "Forgetting the override and then wondering why the derived class is still abstract.",
    advantages: "Every concrete type is forced to define the operation.",
    disadvantages: "A wide pure-virtual list is painful for every derived class.",
  },
  {
    id: "abstract",
    category: "Advanced OOP",
    title: "Abstract classes",
    definition: "An abstract class is a base you cannot construct. It exists to be derived from.",
    explanation:
      "MarketData declares fetchPrice() and displayMarketData() as pure virtual. LiveQuote and CachedQuote implement them. Code can store MarketData pointers and never know which feed answered.",
    analogy: "A job description. You hire a person who meets it. You cannot hire the description.",
    nest: "The market service hides Yahoo’s response format behind a price result. MarketData is the classroom version of that boundary.",
    syntax: "class MarketData { public: virtual double fetchPrice() = 0; virtual void displayMarketData() = 0; };",
    code: `class MarketData {
 public:
  virtual double fetchPrice() = 0;
  virtual void displayMarketData() = 0;
  virtual ~MarketData() = default;
};
class CachedQuote : public MarketData {
 public:
  explicit CachedQuote(double price) : price_(price) {}
  double fetchPrice() override { return price_; }
  void displayMarketData() override { std::cout << "cached " << price_ << "\\n"; }
 private:
  double price_;
};`,
    output: "cached 190",
    lines: [
      "MarketData is abstract because both functions are pure virtual.",
      "CachedQuote stores a price and implements both functions.",
      "displayMarketData prints the cached value.",
      "A MarketData pointer can point at CachedQuote.",
    ],
    visual: "MarketData* feed = new CachedQuote(190); feed->displayMarketData();",
    mistakes: "Trying to construct MarketData, or deleting it without a virtual destructor.",
    advantages: "Feeds can be swapped without changing the caller.",
    disadvantages: "The abstract class can become a dumping ground for unrelated functions.",
  },
  {
    id: "friend",
    category: "Advanced OOP",
    title: "Friend functions and classes",
    definition: "A friend is a function or class allowed to read private members.",
    explanation:
      "Friendship is granted by the class, not taken by the outsider. A friend function is not a member, but it can use private fields. A friend class gets that access for all of its members. Friendship is not inherited and is not symmetric.",
    analogy: "A named auditor may open the locked drawer. A passerby may not.",
    nest: "A Portfolio report might be a friend of Stock so it can read the private cost basis for one statement, without making cost public to the whole program.",
    syntax: "friend double reportValue(const Stock&); friend class Portfolio;",
    code: `class Stock {
 public:
  Stock(std::string symbol, double cost) : symbol_(symbol), cost_(cost) {}
  friend double reportValue(const Stock& s);
  friend class Portfolio;
 private:
  std::string symbol_;
  double cost_;
};
double reportValue(const Stock& s) { return s.cost_; }
class Portfolio {
 public:
  double peek(const Stock& s) const { return s.cost_; }
};`,
    output: "reportValue(apple) → private cost\nPortfolio::peek → same private cost",
    lines: [
      "reportValue is a friend function, not a member.",
      "It reads cost_ even though cost_ is private.",
      "Portfolio is a friend class, so peek can also read cost_.",
      "Other functions still cannot touch cost_.",
    ],
    visual: "Stock private cost ← friend reportValue and friend Portfolio. Everyone else is blocked.",
    mistakes: "Friending a class just to skip writing a getter. That spreads access too far.",
    advantages: "A tight helper can see internals without making them public.",
    disadvantages: "Friends weaken the boundary. Use them rarely.",
  },
  {
    id: "operators",
    category: "Advanced OOP",
    title: "Operator overloading",
    definition: "You can define what an operator means for a class you wrote.",
    explanation:
      "== can compare two stocks by ticker. + can add notionals. << can print a stock to a stream. You cannot invent new operator spellings, and a few operators cannot be overloaded. Prefer a named function when the symbol would surprise a reader.",
    analogy: "A plus sign on two invoices means “add the totals,” not “add the paper.”",
    nest: "Two study lots can be compared by symbol or combined into one notional. The live P&L math stays in the C++ service; this operator is a lesson.",
    syntax: "bool operator==(const Stock&, const Stock&); Stock operator+(const Stock&, const Stock&);",
    code: `class Stock {
 public:
  std::string symbol;
  double notional = 0;
};
bool operator==(const Stock& a, const Stock& b) { return a.symbol == b.symbol; }
Stock operator+(const Stock& a, const Stock& b) {
  Stock sum = a;
  sum.notional += b.notional;
  return sum;
}
std::ostream& operator<<(std::ostream& out, const Stock& s) {
  return out << s.symbol << " " << s.notional;
}`,
    output: "AAPL 100 == AAPL 40 → true\nAAPL 100 + AAPL 40 → AAPL 140",
    lines: [
      "== compares symbols, not prices.",
      "+ copies the left stock and adds notionals.",
      "<< prints symbol and notional.",
      "The operators are ordinary functions with operator in the name.",
    ],
    visual: "AAPL 100  +  AAPL 40  →  AAPL 140",
    mistakes: "Making + change its left argument, or making == compare only the price.",
    advantages: "Formulas read like the desk writes them.",
    disadvantages: "A clever operator hides an expensive copy.",
  },
  {
    id: "pointers",
    category: "C++ programming",
    title: "Pointers",
    definition: "A pointer stores the address of an object.",
    explanation:
      "& takes the address. * reads the object at that address. ptr->price is the same as (*ptr).price for a pointer to an object. A null pointer must not be dereferenced.",
    analogy: "A locker number is not the coat. It tells you which locker holds the coat.",
    nest: "A study list can keep pointers to Stock objects so rearranging the list does not copy every holding.",
    syntax: "Stock* p = &apple; p->updatePrice(200);",
    code: `Stock apple("AAPL", 190);
Stock* p = &apple;
p->updatePrice(200);
std::cout << apple.price();`,
    output: "200",
    lines: [
      "p stores the address of apple.",
      "p->updatePrice changes the same object.",
      "apple.price() sees 200 because there is only one object.",
      "p is not a second stock.",
    ],
    visual: "p  →  apple { AAPL, 200 }",
    mistakes: "Using a pointer after the object is gone, or forgetting that two pointers can name one object.",
    advantages: "Large objects can be shared without copying them.",
    disadvantages: "Lifetime mistakes crash or corrupt data.",
  },
  {
    id: "dynamic",
    category: "C++ programming",
    title: "Dynamic memory",
    definition: "new creates an object on the free store. delete destroys it.",
    explanation:
      "The object lives until you delete it, not until the function ends. delete[] matches new[]. A shallow copy copies the pointer, so two objects think they own one block. A deep copy allocates a new block and copies the values. Prefer containers and smart pointers over bare new.",
    analogy: "Renting a storage unit. You must end the rental, or you keep paying and nobody else can use it.",
    nest: "A study Portfolio might new a Stock when a lot is added and delete it when the lot is removed. The lesson stops at the demo. It does not allocate inside the live page.",
    syntax: "Stock* p = new Stock(\"AAPL\", 190); delete p;",
    code: `Stock* p = new Stock("AAPL", 190);
std::cout << p->symbol() << "\\n";
delete p;
p = nullptr;`,
    output: "AAPL\nobject destroyed",
    lines: [
      "new runs the constructor and returns a pointer.",
      "The object is not tied to the enclosing block.",
      "delete runs the destructor and frees the memory.",
      "Setting p to nullptr avoids a second delete on the same address.",
    ],
    visual: "new → heap object. delete → gone. A second owner of the same pointer is a shallow copy.",
    mistakes: "delete twice, mixing new[] with delete, or a shallow copy that double-frees.",
    advantages: "The size of a list can grow at run time.",
    disadvantages: "You must match every new with one delete.",
  },
  {
    id: "files",
    category: "C++ programming",
    title: "File handling",
    definition: "ifstream reads a file, ofstream writes one, and fstream can do both.",
    explanation:
      "Open the file, check the stream, read or write, then let the destructor close it or call close(). Append mode is std::ios::app. A failed open sets the fail bit. This page does not write a file on the server. The demo keeps lines in memory so you can see the same steps.",
    analogy: "A ledger book. You open it, add a line, read it back, and close it.",
    nest: "A C++ desk can store trades, read a saved portfolio, and write a P&L report. NestInvest’s live lots stay in the browser store. This lesson shows the file API, not a new database.",
    syntax: "std::ofstream out(\"trades.txt\", std::ios::app); out << symbol << \" \" << qty << \"\\n\";",
    code: `std::ofstream out("trades.txt");
out << "AAPL 10 180\\n";
out.close();
std::ifstream in("trades.txt");
std::string line;
std::getline(in, line);
std::cout << line;`,
    output: "AAPL 10 180",
    lines: [
      "ofstream creates or replaces the file for writing.",
      "The insertion writes one trade record.",
      "close() finishes the write. The destructor would also close it.",
      "ifstream and getline read that record back.",
      "ios::app would add a line without erasing older ones.",
    ],
    visual: "Program → ofstream → trades.txt → ifstream → program.",
    mistakes: "Ignoring a failed open, or writing a report path the process cannot access.",
    advantages: "Records survive after the program exits.",
    disadvantages: "Files need paths, permissions, and a format that stays stable.",
  },
  {
    id: "exceptions",
    category: "C++ programming",
    title: "Exception handling",
    definition: "throw reports a failure. try and catch handle it.",
    explanation:
      "Throw an object, often a type derived from std::exception. Handlers are tried in order. A catch (...) is a last resort. Do not use exceptions for ordinary branches such as “ticker not on the watchlist” if a return value is clearer. Do use them when a price is negative or a file cannot be opened.",
    analogy: "A fire alarm. Normal work stops, and the handler that knows this alarm takes over.",
    nest: "A study order can reject a negative quantity or a zero divisor in a return calculation. The live C++ service already returns an error message for a bad ticker, and a failed headline fetch is caught so the rest of the news list still returns.",
    syntax: "try { if (price < 0) throw std::invalid_argument(\"price\"); } catch (const std::invalid_argument& e) { }",
    code: `class BadQuantity : public std::runtime_error {
 public:
  explicit BadQuantity() : std::runtime_error("quantity must be positive") {}
};
double pnl(double price, double buy, int qty) {
  if (qty <= 0) throw BadQuantity();
  if (price < 0) throw std::invalid_argument("price");
  return (price - buy) * qty;
}`,
    output: "qty -1 → catch BadQuantity: quantity must be positive\nprice -5 → catch invalid_argument",
    lines: [
      "BadQuantity is a custom exception.",
      "throw leaves pnl immediately.",
      "The matching catch runs.",
      "A later catch can handle a different type.",
      "Division by a zero cost would be another throw, not a crash.",
    ],
    visual: "try { pnl } → throw → catch BadQuantity or catch invalid_argument.",
    mistakes: "Catching every exception and ignoring it. Throwing a raw string with no type.",
    advantages: "A deep failure can reach the code that can tell the user.",
    disadvantages: "Hidden jumps make the next line less obvious.",
  },
  {
    id: "static",
    category: "C++ programming",
    title: "Static members",
    definition: "A static data member is shared by every object. A static function can be called without an object.",
    explanation:
      "count_ lives once, not once per stock. The constructor increments it. Stock::created() reads it. A static function has no this pointer, so it cannot touch a particular object’s price unless you pass the object in.",
    analogy: "A shop tally of tickets issued. Each ticket has its own price. The tally belongs to the shop.",
    nest: "A study desk can show how many Stock objects have been constructed in the lesson. That counter is not the number of live quotes on the market strip.",
    syntax: "static int count_; static int created();",
    code: `class Stock {
 public:
  Stock() { ++count_; }
  ~Stock() { --count_; }
  static int created() { return count_; }
 private:
  static int count_;
};
int Stock::count_ = 0;`,
    output: "after two Stock objects: created() == 2\nafter both leave scope: created() == 0",
    lines: [
      "count_ is declared inside the class and defined once outside.",
      "Every constructor shares that one integer.",
      "created() is called as Stock::created().",
      "There is no this inside created().",
    ],
    visual: "apple and msft both point at one count_ box.",
    mistakes: "Forgetting the out-of-class definition, which fails the link.",
    advantages: "A true program-wide count does not need a global variable.",
    disadvantages: "Shared mutable state is harder to test.",
  },
  {
    id: "this",
    category: "C++ programming",
    title: "The this pointer",
    definition: "this points at the object the member function was called on.",
    explanation:
      "Inside a member function, this->price_ is that object’s price. It is used to tell a member from a parameter with the same name, and to return *this so calls can chain.",
    analogy: "When you say “my price,” my means the ticket in your hand, not every ticket.",
    nest: "updatePrice on one holding must change that holding. this is how the function knows which object received the call.",
    syntax: "Stock& updatePrice(double price) { this->price_ = price; return *this; }",
    code: `class Stock {
 public:
  Stock(double price) : price_(price) {}
  Stock& updatePrice(double price) {
    this->price_ = price;
    return *this;
  }
  double price() const { return this->price_; }
 private:
  double price_;
};
Stock s(190);
s.updatePrice(195).updatePrice(200);`,
    output: "200",
    lines: [
      "The constructor initializer sets this object’s price_.",
      "this->price_ names the member, not the parameter.",
      "return *this returns the same object.",
      "The second updatePrice runs on that same object.",
    ],
    visual: "s.updatePrice → this == &s → s.price_ = 200.",
    mistakes: "Returning a reference to a local object. this is never that.",
    advantages: "Chaining and disambiguation stay explicit.",
    disadvantages: "Using this-> on every line adds noise when the names already differ.",
  },
  {
    id: "templates",
    category: "Advanced C++",
    title: "Templates",
    definition: "A template writes one piece of code that works for several types.",
    explanation:
      "A function template such as larger<T> compares two values of type T. A class template such as Portfolio<T> stores records of type T. The compiler creates a version when you use it, for double or for string.",
    analogy: "One labeled box design that can hold either coins or share certificates.",
    nest: "A generic ledger can store stock lots or fund lots without copying the container code. The web desk is not this template. The idea is how a C++ core would stay reusable.",
    syntax: "template <typename T> class Portfolio { std::vector<T> rows_; };",
    code: `template <typename T>
class Portfolio {
 public:
  void add(T row) { rows_.push_back(row); }
  std::size_t size() const { return rows_.size(); }
 private:
  std::vector<T> rows_;
};
template <typename T>
T larger(T a, T b) { return a > b ? a : b; }`,
    output: "Portfolio<std::string> holds AAPL, MSFT → size 2\nlarger(180.0, 190.0) → 190",
    lines: [
      "template <typename T> introduces the type parameter.",
      "Portfolio<std::string> is one generated class.",
      "Portfolio<double> would be another.",
      "larger is a function template. The argument type fills in T.",
    ],
    visual: "Portfolio<T> → Portfolio<string> lots, or Portfolio<double> notionals.",
    mistakes: "Putting a template definition only in a .cpp file and then failing to instantiate it.",
    advantages: "Containers stay type-safe without hand-written copies.",
    disadvantages: "Error messages are long, and each type adds code.",
  },
  {
    id: "stl",
    category: "Advanced C++",
    title: "STL containers and algorithms",
    definition: "The standard library gives containers and algorithms that work with iterators.",
    explanation:
      "vector is a growable array. list is a linked list. stack and queue restrict how you add and remove. priority_queue serves the highest item first. map keeps keys in order. unordered_map hashes keys. set stores unique sorted keys. sort, find, binary_search, reverse, count, max_element, and min_element operate on ranges.",
    analogy: "Ready-made drawers, plus a clerk who can sort or search whatever drawer you point at.",
    nest: "The DSA Engine shows the same ideas by hand on live quotes. The C++ service keeps the latest headlines in a vector, skips a repeated id, and sorts that vector by publish time. This card does not replace the DSA Engine.",
    syntax: "std::vector<std::string> book; std::sort(book.begin(), book.end());",
    code: `std::vector<std::string> book{"NVDA", "AAPL", "MSFT"};
std::sort(book.begin(), book.end());
auto it = std::find(book.begin(), book.end(), "MSFT");
std::map<std::string, double> last{{"AAPL", 190}};
std::priority_queue<double> hot;`,
    output: "AAPL MSFT NVDA\nfind MSFT → present\nmap[AAPL] → 190",
    lines: [
      "vector stores the three tickers in one block.",
      "sort rearranges the range from begin to end.",
      "find walks until it sees MSFT or end.",
      "map looks up a price by ticker.",
      "priority_queue would surface the largest score first.",
    ],
    visual: "unsorted NVDA AAPL MSFT → sorted AAPL MSFT NVDA.",
    mistakes: "binary_search on an unsorted vector. It requires sorted data.",
    advantages: "Well-tested structures save time and bugs.",
    disadvantages: "The wrong container makes a simple job slow or awkward.",
  },
  {
    id: "iterators",
    category: "Advanced C++",
    title: "Iterators",
    definition: "An iterator marks a position in a container and can move to the next one.",
    explanation:
      "begin() is the first element. end() is one past the last, not the last element. A loop from begin to end visits every item. Algorithms take a pair of iterators instead of a container type, so sort works on a vector or an array.",
    analogy: "A bookmark. You read the current page, then move the bookmark forward. The end bookmark sits after the last page.",
    nest: "A C++ report can walk every lot in a portfolio with the same loop shape, whether the lots sit in a vector or a list.",
    syntax: "for (auto it = book.begin(); it != book.end(); ++it) use(*it);",
    code: `std::vector<std::string> book{"AAPL", "MSFT"};
for (auto it = book.begin(); it != book.end(); ++it) {
  std::cout << *it << " ";
}`,
    output: "AAPL MSFT",
    lines: [
      "it starts at begin().",
      "The loop stops when it equals end().",
      "*it reads the current ticker.",
      "++it moves to the next element.",
    ],
    visual: "begin → AAPL → MSFT → end",
    mistakes: "Dereferencing end(), or caching end() across an insertion that invalidates iterators.",
    advantages: "Algorithms and containers stay independent.",
    disadvantages: "A invalidated iterator looks like a normal pointer and then fails.",
  },
  {
    id: "smart",
    category: "Advanced C++",
    title: "Smart pointers",
    definition: "A smart pointer owns a heap object and destroys it automatically.",
    explanation:
      "std::unique_ptr has one owner. Moving it transfers ownership. std::shared_ptr counts owners and deletes the object when the count hits zero. They express shallow sharing or exclusive ownership without a handwritten delete.",
    analogy: "A coat check with one ticket, or several tickets that all count. The coat is released when the last ticket is returned.",
    nest: "A study Portfolio can hold unique_ptr<Stock> so removing a lot destroys the stock. The live page does not use these types.",
    syntax: "auto p = std::make_unique<Stock>(\"AAPL\", 190);",
    code: `auto lot = std::make_unique<Stock>("AAPL", 190);
std::cout << lot->symbol() << "\\n";
lot.reset();`,
    output: "AAPL\nStock destructor runs at reset",
    lines: [
      "make_unique allocates the Stock.",
      "lot acts like a pointer with ->.",
      "reset() destroys the Stock now.",
      "If reset is skipped, the unique_ptr’s destructor still deletes it.",
    ],
    visual: "unique_ptr —sole owner→ Stock. reset drops the link and the object.",
    mistakes: "Creating two unique_ptrs from the same raw pointer. Sharing one object needs shared_ptr, used sparingly.",
    advantages: "Exceptions and early returns still free the object.",
    disadvantages: "shared_ptr cycles never reach zero. A cycle needs a weak_ptr.",
  },
  {
    id: "namespaces",
    category: "Advanced C++",
    title: "Namespaces",
    definition: "A namespace groups names so two libraries can use the same word.",
    explanation:
      "nest::Quote and feed::Quote are different types. std is the namespace of the standard library. A using directive dumps every name into the current scope and is a poor idea in a header. Prefer std::string or a narrow using declaration.",
    analogy: "Two people named Price. You say “desk Price” or “feed Price.”",
    nest: "The market service can keep its helpers in a private namespace so they do not collide with library names. The web components are not C++ namespaces.",
    syntax: "namespace nest { class Quote {}; } nest::Quote q;",
    code: `namespace nest {
struct Quote { std::string symbol; };
}
namespace feed {
struct Quote { double last; };
}
nest::Quote desk{"AAPL"};
feed::Quote tape{190};`,
    output: "desk.symbol is AAPL\ntape.last is 190\nThe two Quote names do not clash",
    lines: [
      "namespace nest opens a named scope.",
      "nest::Quote is qualified so it is not feed::Quote.",
      "std::string is the standard string, not a local one.",
      "The same short name can exist in two namespaces.",
    ],
    visual: "nest::Quote | feed::Quote | std::string",
    mistakes: "using namespace std; in a header, which causes clashes for every file that includes it.",
    advantages: "Libraries compose without renaming everything.",
    disadvantages: "Deep qualification is verbose if the names are not aliased.",
  },
];
