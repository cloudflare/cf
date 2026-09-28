import $traces from "./traces/index.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * request-tracers command
 * @generated from apis/overlays/request-tracers.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "request-tracers",
	describe:
		"Trace how a request would be processed through Cloudflare's rules and configuration pipeline",

	builder: (yargs) => {
		return yargs
			.command($traces)
			.demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
