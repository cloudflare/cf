import $constants from "./constants/index.js";
import $create from "./create.js";
import $delete from "./delete.js";
import $get from "./get.js";
import $interests from "./interests/index.js";
import $list from "./list.js";
import $quota from "./quota/index.js";
import $update from "./update.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * priority-intelligence command group
 * @generated from apis/overlays/cloudforce-one.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "priority-intelligence",
	describe: "Operations for priority-intelligence",

	builder: (yargs) => {
		return yargs
			.command($create)
			.command($delete)
			.command($get)
			.command($list)
			.command($update)
			.command($constants)
			.command($interests)
			.command($quota)
			.demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
