import $bulkedit from "./bulk-edit.js";
import $create from "./create.js";
import $delete from "./delete.js";
import $edit from "./edit.js";
import $get from "./get.js";
import $listtenant from "./list-tenant.js";
import $list from "./list.js";
import $resetexpiration from "./reset-expiration.js";
import $update from "./update.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * rules command group
 * @generated from apis/overlays/zero-trust.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "rules",
	describe: "Operations for gateway.rules",

	builder: (yargs) => {
		return yargs
			.command($bulkedit)
			.command($create)
			.command($delete)
			.command($edit)
			.command($get)
			.command($list)
			.command($listtenant)
			.command($resetexpiration)
			.command($update)
			.demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
