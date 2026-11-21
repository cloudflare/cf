import $doh from "./doh/index.js";
import $trustsettings from "./trust-settings/index.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * organization command group
 * @generated from apis/overlays/zero-trust.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "organization",
	describe: "Operations for organization",

	builder: (yargs) => {
		return yargs
			.command($doh)
			.command($trustsettings)
			.demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
