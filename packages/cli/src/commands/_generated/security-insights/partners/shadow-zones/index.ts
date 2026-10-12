import $list from "./list.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * shadow-zones command group
 * @generated from apis/overlays/security-insights.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "shadow-zones",
	describe: "Operations for partners.shadow-zones",

	builder: (yargs) => {
		return yargs.command($list).demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
