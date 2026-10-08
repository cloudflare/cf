import $regionalservices from "./regional-services/index.js";
import $regions from "./regions/index.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * dls command
 * @generated from apis/overlays/dls.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "dls",
	describe: "dls",

	builder: (yargs) => {
		return yargs
			.command($regionalservices)
			.command($regions)
			.demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
