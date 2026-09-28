import $ql from "./ql.js";
import $qlv2 from "./qlv2.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * graph command group
 * @generated from apis/overlays/cloudforce-one.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "graph",
	describe: "Operations for events.graphql.create.graph",

	builder: (yargs) => {
		return yargs
			.command($ql)
			.command($qlv2)
			.demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
