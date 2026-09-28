import $get from "./get.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * blobs command group
 * @generated from apis/overlays/artifacts.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "blobs",
	describe: "Operations for namespaces.repos.blobs",

	builder: (yargs) => {
		return yargs.command($get).demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
