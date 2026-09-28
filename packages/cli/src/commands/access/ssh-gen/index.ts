import { lazyCommand } from "#lib/lazy-command.js";

export default lazyCommand(
	"ssh-gen",
	"Generate a short-lived certificate for an Access SSH application.",
	() => import("./command.js"),
	{ command: "access ssh-gen", recordArgs: false }
);
