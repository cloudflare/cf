import $aggregates from "./aggregates/index.js";
import $get from "./get.js";
import $list from "./list.js";
import $overtime from "./over-time/index.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * devices command group
 * @generated from apis/overlays/zero-trust.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "devices",
	describe: "Operations for dex.devices",

	builder: (yargs) => {
		return yargs
			.command($get)
			.command($list)
			.command($aggregates)
			.command($overtime)
			.demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
