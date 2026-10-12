import { lazyCommand } from "#lib/lazy-command.js";

export default lazyCommand(
	"codex [implArgs..]",
	"Run Codex through AI Gateway's REST API.",
	() => import("./run.js"),
	{ command: "ai codex", recordArgs: false }
);
