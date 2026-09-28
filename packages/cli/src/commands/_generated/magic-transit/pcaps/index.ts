import $create from "./create.js";
import $download from "./download/index.js";
import $get from "./get.js";
import $list from "./list.js";
import $ownership from "./ownership/index.js";
import $stop from "./stop.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * pcaps command group
 * @generated from apis/overlays/magic-transit.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "pcaps",
	describe:
		"Packet capture requests for debugging traffic flowing through Magic Transit tunnels",

	builder: (yargs) => {
		return yargs
			.command($create)
			.command($get)
			.command($list)
			.command($stop)
			.command($download)
			.command($ownership)
			.demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
