import $create from "./create.js";
import $update from "./update.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * bulk command group
 * @generated from apis/overlays/magic-network-monitoring.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "bulk",
	describe: "Operations for rules.bulk",

	builder: (yargs) => {
		return yargs
			.command($create)
			.command($update)
			.demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
