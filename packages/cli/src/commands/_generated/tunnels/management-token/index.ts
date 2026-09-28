import $create from "./create.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * management-token command group
 * @generated from apis/overlays/tunnels.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "management-token",
	describe: "Operations for management-token",

	builder: (yargs) => {
		return yargs
			.command($create)
			.demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
