import $auditsshsettings from "./audit-ssh-settings/index.js";
import $sshca from "./ssh-ca/index.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * infrastructure command group
 * @generated from apis/overlays/zero-trust.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "infrastructure",
	describe: "Operations for access.infrastructure",

	builder: (yargs) => {
		return yargs
			.command($auditsshsettings)
			.command($sshca)
			.demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
