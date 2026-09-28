import $edit from "./edit.js";
import $list from "./list.js";
import $update from "./update.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * address-spaces command group
 * @generated from apis/overlays/magic-cloud-networking.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "address-spaces",
	describe: "Operations for on-ramps.address-spaces",

	builder: (yargs) => {
		return yargs
			.command($edit)
			.command($list)
			.command($update)
			.demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
