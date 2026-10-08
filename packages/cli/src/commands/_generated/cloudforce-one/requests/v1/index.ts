import $assetnew from "./asset-new/index.js";
import $assets from "./assets/index.js";
import $constants from "./constants.js";
import $create from "./create.js";
import $delete from "./delete.js";
import $get from "./get.js";
import $list from "./list.js";
import $message from "./message/index.js";
import $priority from "./priority/index.js";
import $quota from "./quota.js";
import $types from "./types.js";
import $update from "./update.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * v1 command group
 * @generated from apis/overlays/cloudforce-one.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "v1",
	describe: "Operations for requests.v1",

	builder: (yargs) => {
		return yargs
			.command($constants)
			.command($create)
			.command($delete)
			.command($get)
			.command($list)
			.command($quota)
			.command($types)
			.command($update)
			.command($assetnew)
			.command($assets)
			.command($message)
			.command($priority)
			.demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
