import $refresh from "./refresh.js";
import $revoke from "./revoke.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * tokens command group
 * @generated from apis/overlays/realtime.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "tokens",
	describe: "Access tokens for RealtimeKit meeting participants",

	builder: (yargs) => {
		return yargs
			.command($refresh)
			.command($revoke)
			.demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
