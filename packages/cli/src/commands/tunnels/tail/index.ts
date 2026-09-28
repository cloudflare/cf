import { lazyCommand } from "#lib/lazy-command.js";

export default lazyCommand(
	"tail [tunnel-id]",
	"Stream logs from a remote cloudflared instance.",
	() => import("./command.js"),
	{ command: "tunnels tail", recordArgs: false }
);
