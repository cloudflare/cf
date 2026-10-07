import { lazyCommand } from "#lib/lazy-command.js";

export default lazyCommand(
	"claude [implArgs..]",
	"Run Claude Code through an Access-protected AI Gateway.",
	() => import("./run.js"),
	{ command: "ai claude", recordArgs: false }
);
