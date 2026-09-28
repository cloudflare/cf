import $create from "./create.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * previews command group
 * @generated from apis/overlays/load-balancers.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "previews",
	describe:
		"Health check configurations that probe origin servers and determine pool availability",

	builder: (yargs) => {
		return yargs
			.command($create)
			.demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
