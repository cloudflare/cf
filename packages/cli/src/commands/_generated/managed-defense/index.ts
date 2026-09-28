import $vulnerabilitydiscovery from "./vulnerability-discovery/index.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * managed-defense command
 * @generated from apis/overlays/managed-defense.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "managed-defense",
	describe: "managed-defense",

	builder: (yargs) => {
		return yargs
			.command($vulnerabilitydiscovery)
			.demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
