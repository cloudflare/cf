import { lazyCommand } from "#lib/lazy-command.js";

export default lazyCommand(
	"quick-start <url>",
	"Expose a local URL with a temporary trycloudflare.com tunnel. The tunnel remains active until cf exits.",
	() => import("./command.js"),
	{ command: "tunnels quick-start", recordArgs: false }
);
