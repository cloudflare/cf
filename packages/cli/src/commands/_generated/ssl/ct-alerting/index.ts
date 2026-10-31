import $get from "./get.js";
import $update from "./update.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * ct-alerting command group
 * @generated from apis/overlays/ssl.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "ct-alerting",
	describe: "Operations for ct-alerting",

	builder: (yargs) => {
		return yargs
			.command($get)
			.command($update)
			.demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
