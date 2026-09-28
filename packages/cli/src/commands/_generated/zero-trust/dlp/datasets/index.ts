import $create from "./create.js";
import $delete from "./delete.js";
import $get from "./get.js";
import $list from "./list.js";
import $prepareupload from "./prepare-upload.js";
import $update from "./update.js";
import $upload from "./upload.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * datasets command group
 * @generated from apis/overlays/zero-trust.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "datasets",
	describe: "Data Loss Prevention - manage datasets, versions, and uploads",

	builder: (yargs) => {
		return yargs
			.command($create)
			.command($delete)
			.command($get)
			.command($list)
			.command($prepareupload)
			.command($update)
			.command($upload)
			.demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
