import { lazyCommand } from "#lib/lazy-command.js";

export default lazyCommand(
	"pi [implArgs..]",
	"Run Pi through AI Gateway's REST API.",
	() => import("./run.js"),
	{ command: "ai pi", recordArgs: false }
);
