import $domains from "./domains/index.js";
import $matches from "./matches/index.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * credential-monitor command group
 * @generated from apis/overlays/cloudforce-one.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "credential-monitor",
	describe: "Operations for credential-monitor",

	builder: (yargs) => {
		return yargs
			.command($domains)
			.command($matches)
			.demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
