import $list from "./list.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * shadow-zone-hosts command group
 * @generated from apis/overlays/security-insights.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "shadow-zone-hosts",
	describe: "Operations for partners.shadow-zone-hosts",

	builder: (yargs) => {
		return yargs.command($list).demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
