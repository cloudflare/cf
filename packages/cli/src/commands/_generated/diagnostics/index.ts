import $endpointhealthchecks from "./endpoint-healthchecks/index.js";
import $traceroutes from "./traceroutes/index.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * diagnostics command
 * @generated from apis/overlays/diagnostics.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "diagnostics",
	describe:
		"Network diagnostic tools — traceroutes from Cloudflare's edge and endpoint health checks",

	builder: (yargs) => {
		return yargs
			.command($endpointhealthchecks)
			.command($traceroutes)
			.demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
