import { lazyCommand } from "#lib/lazy-command.js";

export default lazyCommand(
	"diag",
	"Create a diagnostic report from a local cloudflared instance.",
	() => import("./command.js"),
	{ command: "tunnels diag", recordArgs: false }
);
