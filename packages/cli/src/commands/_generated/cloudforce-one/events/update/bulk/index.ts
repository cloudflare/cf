import $patch from "./patch.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * bulk command group
 * @generated from apis/overlays/cloudforce-one.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "bulk",
	describe: "Operations for events.update.bulk",

	builder: (yargs) => {
		return yargs
			.command($patch)
			.demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
