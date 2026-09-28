import $services from "./services/index.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * workers-vpc command
 * @generated from apis/overlays/workers-vpc.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "workers-vpc",
	describe: "workers-vpc",

	builder: (yargs) => {
		return yargs
			.command($services)
			.demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
