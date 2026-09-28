import $summary from "./summary.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * agent-readiness command group
 * @generated from apis/overlays/radar.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "agent-readiness",
	describe: "Agent readiness summary statistics across the Cloudflare network",

	builder: (yargs) => {
		return yargs
			.command($summary)
			.demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
