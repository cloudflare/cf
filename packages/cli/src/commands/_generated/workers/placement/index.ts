import $regions from "./regions/index.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * placement command group
 * @generated from apis/overlays/workers.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "placement",
	describe: "Operations for placement",

	builder: (yargs) => {
		return yargs
			.command($regions)
			.demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
