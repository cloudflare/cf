import $history from "./history/index.js";
import $profile from "./profile/index.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * billing command group
 * @generated from apis/overlays/user.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "billing",
	describe:
		"View billing history and payment profile for your user (deprecated — prefer account-level billing)",

	builder: (yargs) => {
		return yargs
			.command($history)
			.command($profile)
			.demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
