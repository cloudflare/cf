import $addressspaces from "./address-spaces/index.js";
import $apply from "./apply.js";
import $create from "./create.js";
import $delete from "./delete.js";
import $edit from "./edit.js";
import $export from "./export.js";
import $get from "./get.js";
import $list from "./list.js";
import $plan from "./plan.js";
import $update from "./update.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * on-ramps command group
 * @generated from apis/overlays/magic-cloud-networking.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "on-ramps",
	describe: "Operations for on-ramps",

	builder: (yargs) => {
		return yargs
			.command($apply)
			.command($create)
			.command($delete)
			.command($edit)
			.command($export)
			.command($get)
			.command($list)
			.command($plan)
			.command($update)
			.command($addressspaces)
			.demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
