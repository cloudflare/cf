import $audiotracks from "./audio-tracks/index.js";
import $captions from "./captions/index.js";
import $clip from "./clip.js";
import $copy from "./copy.js";
import $create from "./create.js";
import $delete from "./delete.js";
import $directupload from "./direct-upload/index.js";
import $downloads from "./downloads/index.js";
import $edit from "./edit.js";
import $get from "./get.js";
import $list from "./list.js";
import $token from "./token/index.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * videos command group
 * @generated from apis/overlays/stream.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "videos",
	describe: "Aggregate video storage usage statistics for the account",

	builder: (yargs) => {
		return yargs
			.command($clip)
			.command($copy)
			.command($create)
			.command($delete)
			.command($edit)
			.command($get)
			.command($list)
			.command($audiotracks)
			.command($captions)
			.command($directupload)
			.command($downloads)
			.command($token)
			.demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
