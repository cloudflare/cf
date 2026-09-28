import { lazyCommand } from "#lib/lazy-command.js";

export default lazyCommand(
	"ssh-config",
	"Print an example SSH configuration for an Access application.",
	() => import("./command.js"),
	{ command: "access ssh-config", recordArgs: false }
);
