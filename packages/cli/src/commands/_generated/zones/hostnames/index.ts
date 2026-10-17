import $settings from "./settings/index.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * hostnames command group
 * @generated from apis/overlays/zones.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "hostnames",
	describe: "Operations for hostnames",

	builder: (yargs) => {
		return yargs
			.command($settings)
			.demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
