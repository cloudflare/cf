import $download from "./download.js";
import $list from "./list.js";
import $upload from "./upload.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * assets command group
 * @generated from apis/overlays/cloudforce-one.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "assets",
	describe: "Operations for requests.assets",

	builder: (yargs) => {
		return yargs
			.command($download)
			.command($list)
			.command($upload)
			.demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
