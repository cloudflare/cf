import $list from "./list.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * attackers command group
 * @generated from apis/overlays/cloudforce-one.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "attackers",
	describe: "Operations for threat-events.attackers",

	builder: (yargs) => {
		return yargs.command($list).demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
