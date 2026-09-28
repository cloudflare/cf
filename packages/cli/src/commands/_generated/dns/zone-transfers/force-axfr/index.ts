import $create from "./create.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * force-axfr command group
 * @generated from apis/overlays/dns.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "force-axfr",
	describe: "Operations for zone-transfers.force-axfr",

	builder: (yargs) => {
		return yargs
			.command($create)
			.demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
