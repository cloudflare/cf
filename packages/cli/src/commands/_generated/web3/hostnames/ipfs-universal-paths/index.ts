import $contentlists from "./content-lists/index.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * ipfs-universal-paths command group
 * @generated from apis/overlays/web3.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "ipfs-universal-paths",
	describe: "Operations for hostnames.ipfs-universal-paths",

	builder: (yargs) => {
		return yargs
			.command($contentlists)
			.demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
