import $delete from "./delete.js";
import $edit from "./edit.js";
import $get from "./get.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * variants command group
 * @generated from apis/overlays/cache.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "variants",
	describe:
		"Serve different cached versions of an image based on the Accept header (WebP, AVIF, etc.)",

	builder: (yargs) => {
		return yargs
			.command($delete)
			.command($edit)
			.command($get)
			.demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
