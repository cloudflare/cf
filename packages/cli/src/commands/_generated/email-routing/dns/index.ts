import $get from "./get.js";
import $unlock from "./unlock.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * dns command group
 * @generated from apis/overlays/email-routing.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "dns",
	describe: "Inspect or unlock the DNS records required by Email Routing",

	builder: (yargs) => {
		return yargs
			.command($get)
			.command($unlock)
			.demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
