import $bulk from "./bulk/index.js";
import $create from "./create/index.js";
import $delete from "./delete.js";
import $get from "./get/index.js";
import $patch from "./patch.js";
import $relationships from "./relationships/index.js";
import $tags from "./tags/index.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * indicators command group
 * @generated from apis/overlays/cloudforce-one.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "indicators",
	describe: "Operations for events.dataset.indicators",

	builder: (yargs) => {
		return yargs
			.command($delete)
			.command($patch)
			.command($bulk)
			.command($create)
			.command($get)
			.command($relationships)
			.command($tags)
			.demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
