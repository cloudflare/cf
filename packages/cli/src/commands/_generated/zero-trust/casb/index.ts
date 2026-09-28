import $applications from "./applications/index.js";
import $content from "./content/index.js";
import $exports from "./exports/index.js";
import $findingtypes from "./finding-types/index.js";
import $findings from "./findings/index.js";
import $integrations from "./integrations/index.js";
import $policies from "./policies/index.js";
import $remediations from "./remediations/index.js";
import $webhooks from "./webhooks/index.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * casb command group
 * @generated from apis/overlays/zero-trust.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "casb",
	describe: "Operations for casb",

	builder: (yargs) => {
		return yargs
			.command($applications)
			.command($content)
			.command($exports)
			.command($findingtypes)
			.command($findings)
			.command($integrations)
			.command($policies)
			.command($remediations)
			.command($webhooks)
			.demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
