import $create from "./create.js";
import $edit from "./edit.js";
import $get from "./get.js";
import $list from "./list.js";
import $raw from "./raw.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * datasets command group
 * @generated from apis/overlays/cloudforce-one.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "datasets",
	describe: "Operations for threat-events.datasets",

	builder: (yargs) => {
		return yargs
			.command($create)
			.command($edit)
			.command($get)
			.command($list)
			.command($raw)
			.demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
