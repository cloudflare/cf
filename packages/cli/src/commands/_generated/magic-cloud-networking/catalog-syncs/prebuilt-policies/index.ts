import $list from "./list.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * prebuilt-policies command group
 * @generated from apis/overlays/magic-cloud-networking.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "prebuilt-policies",
	describe: "Operations for catalog-syncs.prebuilt-policies",

	builder: (yargs) => {
		return yargs.command($list).demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
