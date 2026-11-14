import { lazyCommand } from "#lib/lazy-command.js";

export default lazyCommand(
	"tail",
	"Stream observability events",
	() => import("./command.js"),
	{
		command: "observability tail",
		classification: { safeFlags: ["all", "dry-run"] },
	}
);
