import $create from "./create.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * publish command group
 * @generated from apis/overlays/zaraz.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "publish",
	describe:
		"Publish pending Zaraz configuration changes to make them live on the zone",

	builder: (yargs) => {
		return yargs
			.command($create)
			.demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
