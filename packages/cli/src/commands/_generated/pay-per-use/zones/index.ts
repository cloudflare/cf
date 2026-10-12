import $getcanbeenabled from "./get-can-be-enabled.js";
import $getconfiguration from "./get-configuration.js";
import $setcanbeenabled from "./set-can-be-enabled.js";
import $updateconfiguration from "./update-configuration.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * zones command group
 * @generated from apis/overlays/pay-per-use.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "zones",
	describe: "Operations for zones",

	builder: (yargs) => {
		return yargs
			.command($getcanbeenabled)
			.command($getconfiguration)
			.command($setcanbeenabled)
			.command($updateconfiguration)
			.demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
