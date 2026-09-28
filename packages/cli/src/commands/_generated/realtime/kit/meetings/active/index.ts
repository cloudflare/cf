import $get from "./get.js";
import $kickall from "./kick-all.js";
import $kick from "./kick.js";
import $muteall from "./mute-all.js";
import $mute from "./mute.js";
import $polls from "./polls/index.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * active command group
 * @generated from apis/overlays/realtime.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "active",
	describe: "Live meeting state and participant controls",

	builder: (yargs) => {
		return yargs
			.command($get)
			.command($kick)
			.command($kickall)
			.command($mute)
			.command($muteall)
			.command($polls)
			.demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
