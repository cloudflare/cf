import $delete from "#commands/containers/images/delete/index.js";
import $list from "#commands/containers/images/list/index.js";
import { withHandWrittenDryRun } from "#lib/hand-written-dry-run.js";
import $prepare from "./prepare.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * images command group
 * @generated from apis/overlays/containers.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "images",
	describe: "Operations for images",

	builder: (yargs) => {
		return yargs
			.command(withHandWrittenDryRun($delete, "preview"))
			.command(withHandWrittenDryRun($list, "preview"))
			.command($prepare)
			.demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
