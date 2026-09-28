import { lazyCommand } from "#lib/lazy-command.js";

export default lazyCommand(
	"deploy [directory]",
	"Deploy a directory of static assets as a Pages deployment",
	() => import("./command.js"),
	{ command: "pages deploy", recordArgs: false }
);
