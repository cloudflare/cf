import $archive from "./archive.js";
import $export from "./export.js";
import $get from "./get.js";
import $list from "./list.js";
import $unarchive from "./unarchive.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * instances command group
 * @generated from apis/overlays/zero-trust.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "instances",
	describe: "Operations for casb.findings.instances",

	builder: (yargs) => {
		return yargs
			.command($archive)
			.command($export)
			.command($get)
			.command($list)
			.command($unarchive)
			.demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
