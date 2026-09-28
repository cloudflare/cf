import $acls from "./acls/index.js";
import $forceaxfr from "./force-axfr/index.js";
import $incoming from "./incoming/index.js";
import $outgoing from "./outgoing/index.js";
import $peers from "./peers/index.js";
import $tsigs from "./tsigs/index.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * zone-transfers command group
 * @generated from apis/overlays/dns.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "zone-transfers",
	describe: "Operations for zone-transfers",

	builder: (yargs) => {
		return yargs
			.command($acls)
			.command($forceaxfr)
			.command($incoming)
			.command($outgoing)
			.command($peers)
			.command($tsigs)
			.demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
