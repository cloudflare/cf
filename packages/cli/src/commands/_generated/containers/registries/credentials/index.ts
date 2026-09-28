import $generate from "./generate.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * credentials command group
 * @generated from apis/overlays/containers.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "credentials",
	describe: "Generate image registry credentials",

	builder: (yargs) => {
		return yargs
			.command($generate)
			.demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
