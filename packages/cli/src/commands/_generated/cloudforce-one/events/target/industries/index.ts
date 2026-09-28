import $catalog from "./catalog/index.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * industries command group
 * @generated from apis/overlays/cloudforce-one.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "industries",
	describe: "Operations for events.target.industries",

	builder: (yargs) => {
		return yargs
			.command($catalog)
			.demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
