import $bulkdelete from "./bulk-delete.js";
import $create from "./create.js";
import $list from "./list.js";
import $prefix from "./prefix/index.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * allowlist command group
 * @generated from apis/overlays/magic-transit.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "allowlist",
	describe: "Operations for advanced-tcp-protection.configs.allowlist",

	builder: (yargs) => {
		return yargs
			.command($bulkdelete)
			.command($create)
			.command($list)
			.command($prefix)
			.demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
