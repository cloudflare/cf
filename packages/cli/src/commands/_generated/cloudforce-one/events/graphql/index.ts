import $create from "./create/index.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * graphql command group
 * @generated from apis/overlays/cloudforce-one.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "graphql",
	describe: "Operations for events.graphql",

	builder: (yargs) => {
		return yargs
			.command($create)
			.demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
