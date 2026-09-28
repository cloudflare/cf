import $updates from "./updates/index.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * scim command group
 * @generated from apis/overlays/zero-trust.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "scim",
	describe: "Operations for access.logs.scim",

	builder: (yargs) => {
		return yargs
			.command($updates)
			.demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
