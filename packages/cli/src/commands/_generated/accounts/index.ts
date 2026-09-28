import $applications from "./applications/index.js";
import $billing from "./billing/index.js";
import $categories from "./categories/index.js";
import $create from "./create.js";
import $delete from "./delete.js";
import $get from "./get.js";
import $list from "./list.js";
import $logs from "./logs/index.js";
import $members from "./members/index.js";
import $subscriptions from "./subscriptions/index.js";
import $tokens from "./tokens/index.js";
import $transformations from "./transformations/index.js";
import $update from "./update.js";
import $utbilling from "./ut-billing/index.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * accounts command
 * @generated from apis/overlays/accounts.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "accounts",
	describe:
		"Account settings, members, roles, subscriptions, and API tokens for your Cloudflare account",

	builder: (yargs) => {
		return yargs
			.command($create)
			.command($delete)
			.command($get)
			.command($list)
			.command($update)
			.command($applications)
			.command($billing)
			.command($categories)
			.command($logs)
			.command($members)
			.command($subscriptions)
			.command($tokens)
			.command($transformations)
			.command($utbilling)
			.demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
