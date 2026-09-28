import $create from "./create.js";
import $revoke from "./revoke.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * tokens command group
 * @generated from apis/overlays/artifacts.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "tokens",
	describe: "Operations for namespaces.tokens",

	builder: (yargs) => {
		return yargs
			.command($create)
			.command($revoke)
			.demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
