import $create from "./create.js";
import $delete from "./delete.js";
import $edit from "./edit.js";
import $get from "./get.js";
import $ipfsuniversalpaths from "./ipfs-universal-paths/index.js";
import $list from "./list.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * hostnames command group
 * @generated from apis/overlays/web3.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "hostnames",
	describe: "Operations for hostnames",

	builder: (yargs) => {
		return yargs
			.command($create)
			.command($delete)
			.command($edit)
			.command($get)
			.command($list)
			.command($ipfsuniversalpaths)
			.demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
