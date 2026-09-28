import $batch from "./batch/index.js";
import $move from "./move.js";
import $organization from "./organization/index.js";
import $profile from "./profile/index.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * account command
 * @generated from apis/overlays/account.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "account",
	describe: "account",

	builder: (yargs) => {
		return yargs
			.command($move)
			.command($batch)
			.command($organization)
			.command($profile)
			.demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
