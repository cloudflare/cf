import $routing from "./routing/index.js";
import $security from "./security/index.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * email command group
 * @generated from apis/overlays/radar.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "email",
	describe:
		"Email security trends — DMARC/SPF/DKIM adoption, spam, and phishing statistics",

	builder: (yargs) => {
		return yargs
			.command($routing)
			.command($security)
			.demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
