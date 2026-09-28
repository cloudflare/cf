import $create from "./create.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * preview-tokens command group
 * @generated from apis/overlays/custom-pages.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "preview-tokens",
	describe: "Preview tokens for account-level custom pages",

	builder: (yargs) => {
		return yargs
			.command($create)
			.demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
