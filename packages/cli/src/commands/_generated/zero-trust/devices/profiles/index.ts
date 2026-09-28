import $custom from "./custom/index.js";
import $default from "./default/index.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * profiles command group
 * @generated from apis/overlays/zero-trust.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "profiles",
	describe: "Operations for devices.profiles",

	builder: (yargs) => {
		return yargs
			.command($custom)
			.command($default)
			.demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
