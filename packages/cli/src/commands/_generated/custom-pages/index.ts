import $accountcustompages from "./account-custom-pages/index.js";
import $assets from "./assets/index.js";
import $get from "./get.js";
import $list from "./list.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * custom-pages command
 * @generated from apis/overlays/custom-pages.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "custom-pages",
	describe:
		"Manage custom error and challenge pages and their assets for accounts and zones",

	builder: (yargs) => {
		return yargs
			.command($get)
			.command($list)
			.command($accountcustompages)
			.command($assets)
			.demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
