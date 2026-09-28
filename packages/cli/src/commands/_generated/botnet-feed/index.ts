import $asn from "./asn/index.js";
import $configs from "./configs/index.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * botnet-feed command
 * @generated from apis/overlays/botnet-feed.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "botnet-feed",
	describe:
		"Botnet threat intelligence feeds — IP and ASN-level data on known command-and-control infrastructure",

	builder: (yargs) => {
		return yargs
			.command($asn)
			.command($configs)
			.demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
