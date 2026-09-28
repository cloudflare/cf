import $accessrules from "./access-rules/index.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * firewall command group
 * @generated from apis/overlays/user.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "firewall",
	describe: "Firewall operations",

	builder: (yargs) => {
		return yargs
			.command($accessrules)
			.demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
