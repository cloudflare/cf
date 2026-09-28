import $asset from "./asset.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * custom command group
 * @generated from apis/overlays/custom-pages.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "custom",
	describe: "Operations for assets.update.custom",

	builder: (yargs) => {
		return yargs
			.command($asset)
			.demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
