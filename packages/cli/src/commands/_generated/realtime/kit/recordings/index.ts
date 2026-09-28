import $active from "./active/index.js";
import $control from "./control.js";
import $get from "./get.js";
import $list from "./list.js";
import $start from "./start.js";
import $tracks from "./tracks/index.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * recordings command group
 * @generated from apis/overlays/realtime.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "recordings",
	describe: "Meeting and participant-track recordings and recording controls",

	builder: (yargs) => {
		return yargs
			.command($control)
			.command($get)
			.command($list)
			.command($start)
			.command($active)
			.command($tracks)
			.demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
