import $catalog from "./catalog/index.js";
import $create from "./create.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * categories command group
 * @generated from apis/overlays/cloudforce-one.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "categories",
	describe: "Operations for events.categories",

	builder: (yargs) => {
		return yargs
			.command($create)
			.command($catalog)
			.demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
