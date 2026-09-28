import { lazyCommand } from "#lib/lazy-command.js";

export default lazyCommand(
	"ready",
	"Check the /ready endpoint exposed by a local cloudflared instance.",
	() => import("./command.js"),
	{ command: "tunnels ready", recordArgs: false }
);
