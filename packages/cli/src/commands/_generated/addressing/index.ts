import $addressmaps from "./address-maps/index.js";
import $leases from "./leases/index.js";
import $loadocuments from "./loa-documents/index.js";
import $prefixes from "./prefixes/index.js";
import $regional_hostnames from "./regional_hostnames/index.js";
import $services from "./services/index.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * addressing command
 * @generated from apis/overlays/addressing.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "addressing",
	describe: "addressing",

	builder: (yargs) => {
		return yargs
			.command($addressmaps)
			.command($leases)
			.command($loadocuments)
			.command($prefixes)
			.command($regional_hostnames)
			.command($services)
			.demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
