import $copy from "./copy/index.js";
import $create from "./create.js";
import $delete from "./delete.js";
import $events from "./events/index.js";
import $groups from "./groups/index.js";
import $indicator from "./indicator/index.js";
import $indicators from "./indicators/index.js";
import $move from "./move/index.js";
import $permissions from "./permissions/index.js";
import $tags from "./tags/index.js";
import $target from "./target/index.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * dataset command group
 * @generated from apis/overlays/cloudforce-one.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "dataset",
	describe: "Operations for events.dataset",

	builder: (yargs) => {
		return yargs
			.command($create)
			.command($delete)
			.command($copy)
			.command($events)
			.command($groups)
			.command($indicator)
			.command($indicators)
			.command($move)
			.command($permissions)
			.command($tags)
			.command($target)
			.demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
