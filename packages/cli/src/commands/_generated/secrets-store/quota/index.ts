import $get from "./get.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * quota command group
 * @generated from apis/overlays/secrets-store.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "quota",
	describe:
		"Account quota limits for secrets stores, secrets count, and storage capacity",

	builder: (yargs) => {
		return yargs.command($get).demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
