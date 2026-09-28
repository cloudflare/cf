import { lazyCommand } from "#lib/lazy-command.js";

export default lazyCommand(
	"token <url>",
	"Print a JWT for authenticating with an Access application.",
	() => import("./command.js"),
	{ command: "access token", recordArgs: false }
);
