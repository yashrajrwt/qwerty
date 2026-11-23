export type Contribution = {
  title: string;
  detail: string;
  tech: string[];
};

export type TeamMember = {
  slug: string;
  name: string;
  role: string;
  summary: string;
  intro: string;
  photo: string;
  contributions: Contribution[];
};

export const COLLABORATIVE: Contribution[] = [
  {
    title: "Split into classes and files",
    detail:
      "The three of you divided the console system into separate classes and source files so each part of the program could be compiled and read on its own.",
    tech: ["C++", "OOP", "Separate compilation"],
  },
  {
    title: "MSYS2 build environment",
    detail:
      "You set up the MSYS2 toolchain so the C++ project could be built on Windows with the same compiler and libraries.",
    tech: ["MSYS2", "g++"],
  },
  {
    title: "GitHub repository",
    detail:
      "You put the source under Git and published the repository so the team could share changes and keep a history of the work.",
    tech: ["Git", "GitHub"],
  },
  {
    title: "Testing",
    detail:
      "You tested the finished console program together, checking the menu paths, live data, and the files the program writes.",
    tech: ["Manual testing"],
  },
  {
    title: "Project reports",
    detail:
      "You prepared the project reports that describe the system, the build, and the work completed for the evaluation.",
    tech: ["Documentation"],
  },
];

export const TEAM: TeamMember[] = [
  {
    slug: "yash-sharma",
    name: "Yash Sharma",
    role: "Menu, news, and watchlist",
    summary: "Built the six-option menu, Finnhub headlines, and the watchlist submenu.",
    intro:
      "Yash Sharma wrote the control loop that runs the console program, the Finnhub news list, and the watchlist commands that add, show, and delete tickers.",
    photo: "/yash.jpg",
    contributions: [
      {
        title: "Interactive six-option menu and main control loop",
        detail:
          "Implemented the interactive six-option menu and the main control loop that manages the application's navigation and user interaction.",
        tech: ["C++", "Control flow", "Console I/O"],
      },
      {
        title: "Latest company news from Finnhub",
        detail:
          "Integrated Finnhub news so the program shows the five latest company headlines together with the source of each story.",
        tech: ["Finnhub API", "C++", "JSON"],
      },
      {
        title: "Watchlist management",
        detail:
          "Implemented adding stocks, viewing the saved list, and removing a stock. Deletion rewrites the vector, and the operations sit in a nested submenu.",
        tech: ["C++", "std::vector", "Nested menu"],
      },
    ],
  },
  {
    slug: "yashraj-rawat",
    name: "Yashraj Rawat",
    role: "Quotes, profiles, and history",
    summary: "Brought in live quotes, the Profile2 company file, and history.txt.",
    intro:
      "Yashraj Rawat connected the live quote fields, the company profile record, and the search history that is saved to and read from history.txt.",
    photo: "/yashraj.jpg",
    contributions: [
      {
        title: "Live stock quote integration",
        detail:
          "Implemented the live quote so the program shows the current price, open, high, low, and previous close.",
        tech: ["Market API", "C++", "JSON"],
      },
      {
        title: "Company profile integration",
        detail:
          "Integrated the Profile2 endpoint for the company name, ticker, country, exchange, industry, IPO date, website, and market capitalization.",
        tech: ["Profile2 API", "C++", "JSON"],
      },
      {
        title: "Search history management",
        detail:
          "Saved each stock search to history.txt and displayed the records that were stored there.",
        tech: ["C++", "File I/O", "history.txt"],
      },
    ],
  },
  {
    slug: "vivek-rana",
    name: "Vivek Rana",
    role: "Console presentation and JSON",
    summary: "Added ANSI colour, banners, the loading dots, and the JSON read path.",
    intro:
      "Vivek Rana handled the coloured console presentation and the libcurl callback that feeds nlohmann/json when an API response arrives.",
    photo: "/vivek.jpg",
    contributions: [
      {
        title: "Coloured console output",
        detail:
          "Implemented ANSI colour codes, console banners, and the loading-dots routine used while the program waits.",
        tech: ["C++", "ANSI escape codes", "Console UI"],
      },
      {
        title: "API response handling and JSON integration",
        detail:
          "Implemented the libcurl write callback that collects the HTTP body, then parsed that body with nlohmann/json so quotes, news, and profiles can be read as structured data.",
        tech: ["libcurl", "nlohmann/json", "C++"],
      },
    ],
  },
];

export function memberBySlug(slug: string) {
  return TEAM.find((member) => member.slug === slug) ?? null;
}
