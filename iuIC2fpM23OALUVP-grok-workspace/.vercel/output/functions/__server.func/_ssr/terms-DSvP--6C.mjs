import { i as require_jsx_runtime } from "../_libs/react+tanstack__react-query.mjs";
import { b as Link } from "../_libs/@tanstack/react-router+[...].mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/terms-DSvP--6C.js
var import_jsx_runtime = require_jsx_runtime();
function AuthShell({ title, kicker, children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("main", {
		className: "flex min-h-screen flex-col bg-background text-foreground",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-6 py-12",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
					to: "/",
					className: "mb-10 flex items-center gap-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
						src: "/logo.png",
						alt: "",
						width: 48,
						height: 40,
						className: "h-11 w-auto object-contain"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "font-display text-3xl leading-none tracking-tight",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "italic",
							children: "Nest"
						}), "Invest"]
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "font-mono text-xs tracking-[0.22em] text-subtle uppercase",
					children: "Hatch · hold · grow"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "font-display mt-3 text-3xl tracking-tight",
					children: title
				}),
				kicker ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-2 text-sm leading-relaxed text-muted",
					children: kicker
				}) : null,
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mt-8",
					children
				})
			]
		})
	});
}
function Terms() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AuthShell, {
		title: "Terms",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "space-y-3 text-sm leading-relaxed text-muted",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "NestInvest is an educational market desk. Forecasts are statistical sketches, not advice. Do not trade solely on what you see here." }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "You are responsible for the email and password you choose. We hash passwords, never store them in the clear, and never ask for them by email except through the official reset page." }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "Social sign-in uses Google or X through the platform broker. Facebook is not available." })
			]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
			to: "/register",
			className: "mt-8 inline-block text-sm underline decoration-border-strong underline-offset-4",
			children: "Back to registration"
		})]
	});
}
//#endregion
export { Terms as component };
