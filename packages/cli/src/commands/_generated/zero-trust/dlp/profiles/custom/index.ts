import $create from "./create.js";
import $delete from "./delete.js";
import $update from "./update.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * custom command group
 * @generated from apis/overlays/zero-trust.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "custom",
	describe: "Data Loss Prevention - manage custom profiles",

	builder: (yargs) => {
		return yargs
			.command($create)
			.command($delete)
			.command($update)
			.demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
