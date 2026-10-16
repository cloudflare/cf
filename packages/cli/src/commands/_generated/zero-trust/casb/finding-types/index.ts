import $create from "./create.js";
import $delete from "./delete.js";
import $get from "./get.js";
import $list from "./list.js";
import $remediationtypes from "./remediation-types/index.js";
import $update from "./update.js";
import $validate from "./validate.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * finding-types command group
 * @generated from apis/overlays/zero-trust.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "finding-types",
	describe: "Operations for casb.finding-types",

	builder: (yargs) => {
		return yargs
			.command($create)
			.command($delete)
			.command($get)
			.command($list)
			.command($update)
			.command($validate)
			.command($remediationtypes)
			.demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
