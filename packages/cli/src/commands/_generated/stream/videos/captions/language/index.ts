import $delete from "./delete.js";
import $generate from "./generate.js";
import $get from "./get.js";
import $upload from "./upload.js";
import $vtt from "./vtt/index.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * language command group
 * @generated from apis/overlays/stream.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "language",
	describe: "Operations for videos.captions.language",

	builder: (yargs) => {
		return yargs
			.command($delete)
			.command($generate)
			.command($get)
			.command($upload)
			.command($vtt)
			.demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
