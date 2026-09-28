import { lazyCommand } from "#lib/lazy-command.js";

export default lazyCommand(
	"check",
	"Profile a Worker's startup performance",
	() => import("./command.js"),
	{
		command: "workers check",
		classification: { safeFlags: ["prebuilt"] },
	}
);
