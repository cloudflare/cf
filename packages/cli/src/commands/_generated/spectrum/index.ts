import $analytics from "./analytics/index.js";
import $apps from "./apps/index.js";
import $protocols from "./protocols/index.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * spectrum command
 * @generated from apis/overlays/spectrum.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "spectrum",
	describe:
		"Proxy and protect arbitrary TCP/UDP applications through Cloudflare's network with DDoS mitigation",

	builder: (yargs) => {
		return yargs
			.command($analytics)
			.command($apps)
			.command($protocols)
			.demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
