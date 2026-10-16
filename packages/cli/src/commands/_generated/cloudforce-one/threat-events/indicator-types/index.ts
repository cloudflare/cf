import $list from "./list.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * indicator-types command group
 * @generated from apis/overlays/cloudforce-one.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "indicator-types",
	describe: "Operations for threat-events.indicator-types",

	builder: (yargs) => {
		return yargs.command($list).demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
