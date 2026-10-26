import $get from "./get.js";
import $list from "./list.js";
import $proximitywords from "./proximity-words/index.js";
import $worker from "./worker/index.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * validators command group
 * @generated from apis/overlays/zero-trust.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "validators",
	describe: "Data Loss Prevention - list and retrieve content validators",

	builder: (yargs) => {
		return yargs
			.command($get)
			.command($list)
			.command($proximitywords)
			.command($worker)
			.demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
