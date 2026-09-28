import $create from "./create.js";
import $delete from "./delete.js";
import $get from "./get.js";
import $list from "./list.js";
import $update from "./update.js";
import $upload from "./upload.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * document-fingerprints command group
 * @generated from apis/overlays/zero-trust.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "document-fingerprints",
	describe:
		"Data Loss Prevention - manage document fingerprints for detecting matching documents",

	builder: (yargs) => {
		return yargs
			.command($create)
			.command($delete)
			.command($get)
			.command($list)
			.command($update)
			.command($upload)
			.demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
