import $create from "./create.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * bulk command group
 * @generated from apis/overlays/cloudforce-one.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "bulk",
	describe: "Operations for events.dataset.indicators.bulk",

	builder: (yargs) => {
		return yargs
			.command($create)
			.demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
