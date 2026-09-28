import $categories from "./categories/index.js";
import $delete from "./delete.js";
import $getbyid from "./get-by-id.js";
import $get from "./get.js";
import $patch from "./patch.js";
import $relationships from "./relationships/index.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * tags command group
 * @generated from apis/overlays/cloudforce-one.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "tags",
	describe: "Operations for events.tags",

	builder: (yargs) => {
		return yargs
			.command($delete)
			.command($get)
			.command($getbyid)
			.command($patch)
			.command($categories)
			.command($relationships)
			.demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
