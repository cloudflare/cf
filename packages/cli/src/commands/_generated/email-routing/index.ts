import $addresses from "./addresses/index.js";
import $disable from "./disable.js";
import $dns from "./dns/index.js";
import $enable from "./enable.js";
import $rules from "./rules/index.js";
import $settings from "./settings/index.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * email-routing command
 * @generated from apis/overlays/email-routing.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "email-routing",
	describe:
		"Route incoming email to verified destination addresses or Workers with routing rules, catch-all behavior, and managed DNS records",

	builder: (yargs) => {
		return yargs
			.command($disable)
			.command($enable)
			.command($addresses)
			.command($dns)
			.command($rules)
			.command($settings)
			.demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
