import $previewtokens from "./preview-tokens/index.js";
import $update from "./update.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * account-custom-pages command group
 * @generated from apis/overlays/custom-pages.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "account-custom-pages",
	describe: "Manage account-level custom pages",

	builder: (yargs) => {
		return yargs
			.command($update)
			.command($previewtokens)
			.demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
