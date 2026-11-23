import $byclass from "./by-class.js";
import $bypartner from "./by-partner.js";
import $byseverity from "./by-severity.js";
import $bytype from "./by-type.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * count command group
 * @generated from apis/overlays/security-insights.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "count",
	describe: "Operations for count",

	builder: (yargs) => {
		return yargs
			.command($byclass)
			.command($bypartner)
			.command($byseverity)
			.command($bytype)
			.demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
