import $create from "./create.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * traces command group
 * @generated from apis/overlays/request-tracers.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "traces",
	describe:
		"Simulate request processing to debug rule matches, transforms, and routing decisions",

	builder: (yargs) => {
		return yargs
			.command($create)
			.demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
