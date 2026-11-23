import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CPP_CATEGORIES, CPP_CONCEPTS, type CppConcept } from "@/lib/cpp-engine";
import { cn } from "@/lib/utils";

type DemoState = {
  symbol: string;
  name: string;
  price: string;
  buy: string;
  qty: string;
  deposit: string;
  withdraw: string;
  other: string;
};

const START: DemoState = {
  symbol: "AAPL",
  name: "Apple",
  price: "195",
  buy: "180",
  qty: "10",
  deposit: "500",
  withdraw: "900",
  other: "40",
};

export function CppEnginePanel() {
  const [category, setCategory] = useState<(typeof CPP_CATEGORIES)[number] | "All">("All");
  const [id, setId] = useState<string>("overview");
  const visible = useMemo(
    () => CPP_CONCEPTS.filter((item) => category === "All" || item.category === category),
    [category],
  );
  const index = visible.findIndex((item) => item.id === id);
  const concept = index >= 0 ? visible[index] : null;

  function open(next: CppConcept | "overview") {
    setId(next === "overview" ? "overview" : next.id);
  }

  return (
    <div className="mt-6 space-y-4">
      <div>
        <p className="font-display text-lg tracking-tight">C++ Engine</p>
        <p className="mt-1 max-w-prose text-sm text-muted">
          Classes, objects, and the standard library, taught with desk examples. Run uses the numbers you type. It does not compile code on the server.
        </p>
      </div>
      <div className="flex gap-2 overflow-x-auto pb-1">
        <Chip active={id === "overview"} onClick={() => open("overview")}>
          Overview
        </Chip>
        {CPP_CATEGORIES.map((item) => (
          <Chip
            key={item}
            active={category === item}
            onClick={() => {
              setCategory(item);
              const first = CPP_CONCEPTS.find((c) => c.category === item);
              if (first) setId(first.id);
            }}
          >
            {item}
          </Chip>
        ))}
        <Chip
          active={category === "All" && id !== "overview"}
          onClick={() => {
            setCategory("All");
            setId(CPP_CONCEPTS[0]!.id);
          }}
        >
          All concepts
        </Chip>
      </div>
      {id === "overview" || !concept ? (
        <Overview onOpen={(next) => open(next)} />
      ) : (
        <Lesson
          key={concept.id}
          concept={concept}
          onPrev={() => index > 0 && setId(visible[index - 1]!.id)}
          onNext={() => index < visible.length - 1 && setId(visible[index + 1]!.id)}
          prevDisabled={index <= 0}
          nextDisabled={index < 0 || index >= visible.length - 1}
        />
      )}
    </div>
  );
}

function Overview({ onOpen }: { onOpen: (concept: CppConcept) => void }) {
  return (
    <div className="space-y-3">
      <section className="nest-card rounded-[var(--radius-lg)] p-4">
        <h3 className="font-display text-base tracking-tight">What this section is</h3>
        <div className="mt-2 space-y-2 text-sm leading-relaxed text-muted">
          <p>C++ is a compiled language used for systems, games, browsers, and trading infrastructure where speed and control over memory matter.</p>
          <p>Object-oriented programming groups data and the functions that protect it into objects. That matters when a stock, a fund, and an account share ideas but follow different rules.</p>
          <p>
            NestInvest’s quotes, charts, search, company news, latest market headlines, profiles, forecast, and profit-and-loss service run in a C++ program. The contribution pages are desk content. They do not add another C++ structure. The pages you see are not C++ classes.
          </p>
          <p>The models below show how a desk can be designed. They are not a claim that every button on this site is a C++ object.</p>
        </div>
      </section>
      {CPP_CATEGORIES.map((category) => (
        <section key={category} className="space-y-2">
          <p className="font-mono text-[11px] tracking-[0.16em] text-subtle uppercase">{category}</p>
          <div className="grid gap-2 sm:grid-cols-2">
            {CPP_CONCEPTS.filter((item) => item.category === category).map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => onOpen(item)}
                className="nest-card rounded-[var(--radius-md)] p-3 text-left"
              >
                <p className="text-sm">{item.title}</p>
                <p className="mt-1 text-xs leading-relaxed text-muted">{item.definition}</p>
              </button>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}

function Lesson({
  concept,
  onPrev,
  onNext,
  prevDisabled,
  nextDisabled,
}: {
  concept: CppConcept;
  onPrev: () => void;
  onNext: () => void;
  prevDisabled: boolean;
  nextDisabled: boolean;
}) {
  const [demo, setDemo] = useState<DemoState>(START);
  const [ran, setRan] = useState(false);
  const [explain, setExplain] = useState(true);
  const output = useMemo(() => (ran ? runDemo(concept.id, demo, concept.output) : ""), [ran, concept, demo]);

  function patch(key: keyof DemoState, value: string) {
    setDemo((prev) => ({ ...prev, [key]: value }));
    setRan(false);
  }

  return (
    <article className="nest-card space-y-4 rounded-[var(--radius-lg)] p-4">
      <div>
        <p className="font-mono text-[11px] tracking-[0.16em] text-subtle uppercase">{concept.category}</p>
        <h3 className="font-display mt-1 text-xl tracking-tight">{concept.title}</h3>
        <p className="mt-2 text-sm leading-relaxed">{concept.definition}</p>
      </div>
      <Block title="Explanation" body={concept.explanation} />
      <Block title="Analogy" body={concept.analogy} />
      <Block title="On the NestInvest desk" body={concept.nest} />
      <Block title="Syntax" body={concept.syntax} mono />
      <pre className="overflow-x-auto rounded-[var(--radius-md)] bg-background p-3 font-mono text-xs leading-relaxed text-muted">{concept.code}</pre>
      <div className="grid gap-2 sm:grid-cols-2">
        <Field label="Symbol" value={demo.symbol} onChange={(v) => patch("symbol", v.toUpperCase())} />
        <Field label="Name" value={demo.name} onChange={(v) => patch("name", v)} />
        <Field label="Price" value={demo.price} onChange={(v) => patch("price", v)} />
        <Field label="Buy price" value={demo.buy} onChange={(v) => patch("buy", v)} />
        <Field label="Quantity" value={demo.qty} onChange={(v) => patch("qty", v)} />
        <Field label="Second value" value={demo.other} onChange={(v) => patch("other", v)} />
      </div>
      <div className="flex flex-wrap gap-2">
        <Button type="button" size="sm" onClick={() => setRan(true)}>
          Run
        </Button>
        <Button
          type="button"
          size="sm"
          variant="secondary"
          onClick={() => {
            setDemo(START);
            setRan(false);
          }}
        >
          Reset
        </Button>
        <Button type="button" size="sm" variant="secondary" onClick={() => setRan(true)}>
          Show output
        </Button>
        <Button type="button" size="sm" variant="ghost" onClick={() => setExplain((v) => !v)}>
          {explain ? "Hide explanation" : "Show explanation"}
        </Button>
      </div>
      {ran && (
        <pre className="overflow-x-auto rounded-[var(--radius-md)] border border-border bg-elevated p-3 font-mono text-xs leading-relaxed">{output}</pre>
      )}
      <p className="rounded-[var(--radius-md)] border border-border bg-elevated px-3 py-2 text-sm text-muted">{concept.visual}</p>
      {explain && (
        <div className="space-y-2">
          <p className="text-xs tracking-wide text-subtle uppercase">Line by line</p>
          <ul className="space-y-1 text-sm leading-relaxed">
            {concept.lines.map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>
        </div>
      )}
      <div className="grid gap-3 sm:grid-cols-2">
        <Block title="Common mistakes" body={concept.mistakes} />
        <Block title="Tradeoff" body={`${concept.advantages} ${concept.disadvantages}`} />
      </div>
      <div className="flex flex-wrap gap-2">
        <Button type="button" size="sm" variant="secondary" onClick={onPrev} disabled={prevDisabled}>
          Previous concept
        </Button>
        <Button type="button" size="sm" variant="secondary" onClick={onNext} disabled={nextDisabled}>
          Next concept
        </Button>
      </div>
    </article>
  );
}

function runDemo(id: string, demo: DemoState, fallback: string) {
  const price = Number(demo.price);
  const buy = Number(demo.buy);
  const qty = Number(demo.qty);
  const other = Number(demo.other);
  const symbol = demo.symbol || "AAPL";
  const name = demo.name || "Apple";
  if (id === "classes" || id === "this") {
    if (!Number.isFinite(price) || !Number.isFinite(qty)) return "Enter a numeric price and quantity.";
    const investment = price * qty;
    const pnl = (price - buy) * qty;
    return `${symbol} ${name} @ ${price} x ${qty}\ninvestment ${investment}\nprofit/loss vs ${buy} = ${Number.isFinite(pnl) ? pnl : "n/a"}`;
  }
  if (id === "encapsulation") {
    const deposit = Number(demo.price);
    const withdraw = Number(demo.other);
    let balance = 0;
    const lines = [];
    if (deposit > 0) {
      balance += deposit;
      lines.push(`deposit ${deposit} → balance ${balance}`);
    } else lines.push("deposit rejected");
    if (withdraw > 0 && withdraw <= balance) {
      balance -= withdraw;
      lines.push(`withdraw ${withdraw} → balance ${balance}`);
    } else lines.push(`withdraw ${withdraw} → rejected`);
    lines.push(`balance() = ${balance}`);
    return lines.join("\n");
  }
  if (id === "polymorphism" || id === "virtual" || id === "pure-virtual") {
    if (!(buy > 0) || !Number.isFinite(price)) return "Enter a buy price above zero and a current price.";
    const stock = (price - buy) / buy;
    const fund = stock * 0.5;
    return `StockInvestment::calculateReturn → ${stock.toFixed(4)}\nFundInvestment::calculateReturn → ${fund.toFixed(4)}`;
  }
  if (id === "operators") {
    if (!Number.isFinite(price) || !Number.isFinite(other)) return "Enter two numeric notionals.";
    const same = symbol.toUpperCase() === symbol.toUpperCase();
    return `${symbol} ${price} == ${symbol} ${other} → ${same}\n${symbol} ${price} + ${symbol} ${other} → ${symbol} ${price + other}`;
  }
  if (id === "exceptions") {
    if (!Number.isFinite(qty) || qty <= 0) return "catch BadQuantity: quantity must be positive";
    if (!Number.isFinite(price) || price < 0) return "catch invalid_argument: price";
    if (!Number.isFinite(buy)) return "catch invalid_argument: buy price";
    return `no throw\nprofit/loss = ${(price - buy) * qty}`;
  }
  if (id === "static") {
    const n = Math.max(0, Math.floor(Number.isFinite(qty) ? qty : 0));
    return `constructed ${n} Stock object${n === 1 ? "" : "s"}\nStock::created() == ${n}`;
  }
  if (id === "stl" || id === "iterators") {
    const book = [symbol, "MSFT", "NVDA"].map((s) => s.toUpperCase()).sort();
    return `${book.join(" ")}\nfind ${symbol.toUpperCase()} → ${book.includes(symbol.toUpperCase()) ? "present" : "absent"}`;
  }
  if (id === "files") {
    return `ofstream write: ${symbol} ${qty} ${buy}\nifstream read: ${symbol} ${qty} ${buy}\n(in-memory lesson, no server file)`;
  }
  if (id === "pointers" || id === "dynamic" || id === "smart") {
    return `${symbol} via pointer → price ${price}\nowner count after reset → 0`;
  }
  if (id === "templates") {
    return `Portfolio<string> add ${symbol} → size 1\nlarger(${price}, ${other}) → ${Math.max(price, other)}`;
  }
  if (id === "namespaces") {
    return `nest::Quote symbol = ${symbol}\nfeed::Quote last = ${price}`;
  }
  if (id === "inheritance") {
    return `${symbol} is a StockInvestment\ncost base is shared from Investment\nBlueChip also receives the ticker`;
  }
  if (id === "abstraction" || id === "abstract") {
    return `MarketData cannot be constructed\nCachedQuote.fetchPrice(${symbol}) → ${price}`;
  }
  if (id === "friend") {
    return `friend reportValue reads private cost ${buy}\nPortfolio::peek reads the same cost`;
  }
  if (id === "constructors") {
    return `default Stock\nparameterized ${symbol} ${price}\ncopy of ${symbol}`;
  }
  if (id === "destructors") {
    return `born ${symbol}\nborn MSFT\ngone MSFT\ngone ${symbol}`;
  }
  return fallback;
}

function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "h-10 shrink-0 rounded-full border px-3 text-sm",
        active ? "border-border-strong bg-elevated text-foreground" : "border-border text-muted",
      )}
    >
      {children}
    </button>
  );
}

function Block({ title, body, mono }: { title: string; body: string; mono?: boolean }) {
  return (
    <div>
      <p className="text-xs tracking-wide text-subtle uppercase">{title}</p>
      <p className={cn("mt-1 text-sm leading-relaxed", mono && "font-mono text-xs")}>{body}</p>
    </div>
  );
}

function Field({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return (
    <label className="block text-xs text-subtle">
      {label}
      <Input className="mt-1" value={value} onChange={(e) => onChange(e.target.value)} aria-label={label} />
    </label>
  );
}
