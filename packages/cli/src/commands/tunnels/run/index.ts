import { lazyCommand } from "#lib/lazy-command.js";

export default lazyCommand(
	"run [tunnel]",
	"Run a named Cloudflare Tunnel using the cf-managed cloudflared binary.",
	() => import("./command.js"),
	{ command: "tunnels run", recordArgs: false }
);
