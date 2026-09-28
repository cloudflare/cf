import $create from "./create.js";
import $delete from "./delete.js";
import $edit from "./edit.js";
import $get from "./get.js";
import $list from "./list.js";
import $quota from "./quota/index.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * certificate-packs command group
 * @generated from apis/overlays/ssl.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "certificate-packs",
	describe: "Operations for certificate-packs",

	builder: (yargs) => {
		return yargs
			.command($create)
			.command($delete)
			.command($edit)
			.command($get)
			.command($list)
			.command($quota)
			.demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
