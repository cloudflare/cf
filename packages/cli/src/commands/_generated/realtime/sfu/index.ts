import $apps from "./apps/index.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * sfu command group
 * @generated from apis/overlays/realtime.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "sfu",
	describe: "SFU apps that route WebRTC media and data between participants",

	builder: (yargs) => {
		return yargs.command($apps).demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
