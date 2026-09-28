import $create from "./create.js";
import $delete from "./delete.js";
import $excludedrecipients from "./excluded-recipients/index.js";
import $get from "./get.js";
import $list from "./list.js";
import $recipients from "./recipients/index.js";
import $resources from "./resources/index.js";
import $update from "./update.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * resource-sharing command
 * @generated from apis/overlays/resource-sharing.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "resource-sharing",
	describe:
		"Share Cloudflare resources (zones, accounts) across organizations with granular access controls",

	builder: (yargs) => {
		return yargs
			.command($create)
			.command($delete)
			.command($get)
			.command($list)
			.command($update)
			.command($excludedrecipients)
			.command($recipients)
			.command($resources)
			.demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
