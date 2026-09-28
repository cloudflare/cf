import $namespaces from "./namespaces/index.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * artifacts command
 * @generated from apis/overlays/artifacts.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "artifacts",
	describe: "artifacts",

	builder: (yargs) => {
		return yargs
			.command($namespaces)
			.demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
