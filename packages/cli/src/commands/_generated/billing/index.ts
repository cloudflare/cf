import $addresses from "./addresses/index.js";
import $profiles from "./profiles/index.js";
import $rateplans from "./rate-plans/index.js";
import $usage from "./usage/index.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * billing command
 * @generated from apis/overlays/billing.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "billing",
	describe:
		"Account billing profiles and usage data for Cloudflare subscriptions and add-on services",

	builder: (yargs) => {
		return yargs
			.command($addresses)
			.command($profiles)
			.command($rateplans)
			.command($usage)
			.demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
