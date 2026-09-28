import { lazyCommand } from "#lib/lazy-command.js";

export default lazyCommand(
	"login <url>",
	"Authenticate with an Access application and store its JWT through cloudflared.",
	() => import("./command.js"),
	{ command: "access login", recordArgs: false }
);
