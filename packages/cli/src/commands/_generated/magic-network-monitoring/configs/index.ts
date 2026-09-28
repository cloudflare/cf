import $create from "./create.js";
import $delete from "./delete.js";
import $edit from "./edit.js";
import $full from "./full/index.js";
import $get from "./get.js";
import $update from "./update.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * configs command group
 * @generated from apis/overlays/magic-network-monitoring.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "configs",
	describe:
		"Account-level monitoring configuration — sampling rates, thresholds, and notification settings",

	builder: (yargs) => {
		return yargs
			.command($create)
			.command($delete)
			.command($edit)
			.command($get)
			.command($update)
			.command($full)
			.demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
