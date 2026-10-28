import $get from "./get.js";
import $replace from "./replace.js";
import $update from "./update.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * trust-settings command group
 * @generated from apis/overlays/zero-trust.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "trust-settings",
	describe: "Operations for organization.trust-settings",

	builder: (yargs) => {
		return yargs
			.command($get)
			.command($replace)
			.command($update)
			.demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
