import $advertisements from "./advertisements/index.js";
import $bulk from "./bulk/index.js";
import $create from "./create.js";
import $delete from "./delete.js";
import $edit from "./edit.js";
import $get from "./get.js";
import $list from "./list.js";
import $update from "./update.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * rules command group
 * @generated from apis/overlays/magic-network-monitoring.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "rules",
	describe:
		"Monitoring rules that define traffic thresholds and trigger alerts or prefix advertisements",

	builder: (yargs) => {
		return yargs
			.command($create)
			.command($delete)
			.command($edit)
			.command($get)
			.command($list)
			.command($update)
			.command($advertisements)
			.command($bulk)
			.demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
