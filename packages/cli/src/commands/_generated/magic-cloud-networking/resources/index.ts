import $export from "./export.js";
import $get from "./get.js";
import $list from "./list.js";
import $policypreview from "./policy-preview.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * resources command group
 * @generated from apis/overlays/magic-cloud-networking.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "resources",
	describe: "Operations for resources",

	builder: (yargs) => {
		return yargs
			.command($export)
			.command($get)
			.command($list)
			.command($policypreview)
			.demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
