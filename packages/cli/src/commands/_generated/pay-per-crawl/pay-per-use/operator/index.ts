import $getconfiguration from "./get-configuration.js";
import $setconfiguration from "./set-configuration.js";
import $updateconfiguration from "./update-configuration.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * operator command group
 * @generated from apis/overlays/pay-per-crawl.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "operator",
	describe: "Operations for pay-per-use.operator",

	builder: (yargs) => {
		return yargs
			.command($getconfiguration)
			.command($setconfiguration)
			.command($updateconfiguration)
			.demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
