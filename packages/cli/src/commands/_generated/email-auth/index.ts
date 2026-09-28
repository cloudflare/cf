import $dmarcreports from "./dmarc-reports/index.js";
import $spf from "./spf/index.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * email-auth command
 * @generated from apis/overlays/email-auth.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "email-auth",
	describe: "email-auth",

	builder: (yargs) => {
		return yargs
			.command($dmarcreports)
			.command($spf)
			.demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
