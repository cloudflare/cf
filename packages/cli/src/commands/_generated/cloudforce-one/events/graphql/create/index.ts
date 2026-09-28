import $graph from "./graph/index.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * create command group
 * @generated from apis/overlays/cloudforce-one.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "create",
	describe: "Operations for events.graphql.create",

	builder: (yargs) => {
		return yargs
			.command($graph)
			.demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
