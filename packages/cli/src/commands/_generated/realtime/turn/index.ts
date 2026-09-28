import $keys from "./keys/index.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * turn command group
 * @generated from apis/overlays/realtime.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "turn",
	describe: "TURN keys that help clients traverse NATs and firewalls",

	builder: (yargs) => {
		return yargs.command($keys).demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
