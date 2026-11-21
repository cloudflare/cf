import $delete from "./delete.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * custom-nameservers command
 * @generated from apis/overlays/custom-nameservers.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "custom-nameservers",
	describe: "custom-nameservers",

	builder: (yargs) => {
		return yargs
			.command($delete)
			.demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
