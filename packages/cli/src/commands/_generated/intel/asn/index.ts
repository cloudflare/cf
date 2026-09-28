import $get from "./get.js";
import $subnets from "./subnets/index.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * asn command group
 * @generated from apis/overlays/intel.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "asn",
	describe:
		"ASN intelligence — ownership, geolocation, and subnet details for autonomous systems",

	builder: (yargs) => {
		return yargs
			.command($get)
			.command($subnets)
			.demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
