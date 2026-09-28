import $create from "./create.js";
import $delete from "./delete.js";
import $get from "./get/index.js";
import $update from "./update.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * applications command group
 * @generated from apis/overlays/accounts.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "applications",
	describe: "Applications operations",

	builder: (yargs) => {
		return yargs
			.command($create)
			.command($delete)
			.command($update)
			.command($get)
			.demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
