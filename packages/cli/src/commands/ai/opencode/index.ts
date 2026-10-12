import { lazyCommand } from "#lib/lazy-command.js";

export default lazyCommand(
	"opencode [implArgs..]",
	"Run OpenCode through AI Gateway's REST API.",
	() => import("./run.js"),
	{ command: "ai opencode", recordArgs: false }
);
