import $get from "./get.js";
import $rotateseed from "./rotate-seed.js";
import $update from "./update.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * audit-ssh-settings command group
 * @generated from apis/overlays/zero-trust.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "audit-ssh-settings",
	describe: "Operations for access.infrastructure.audit-ssh-settings",

	builder: (yargs) => {
		return yargs
			.command($get)
			.command($rotateseed)
			.command($update)
			.demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
