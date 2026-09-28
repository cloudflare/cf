import { lazyCommand } from "#lib/lazy-command.js";

export default lazyCommand(
	"curl <url>",
	"Run curl against an Access-protected application with its JWT injected by cloudflared.",
	() => import("./command.js"),
	{ command: "access curl", recordArgs: false }
);
