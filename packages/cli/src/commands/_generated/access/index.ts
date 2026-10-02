import $curl from "#commands/access/curl/index.js";
import $login from "#commands/access/login/index.js";
import $sshconfig from "#commands/access/ssh-config/index.js";
import $sshgen from "#commands/access/ssh-gen/index.js";
import $tcp from "#commands/access/tcp/index.js";
import $token from "#commands/access/token/index.js";
import { withHandWrittenDryRun } from "#lib/hand-written-dry-run.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * access command
 * @generated from apis/overlays/access.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "access",
	describe: "Access protected applications and services",

	builder: (yargs) => {
		return yargs
			.command(withHandWrittenDryRun($curl, "preview"))
			.command(withHandWrittenDryRun($login, "preview"))
			.command(withHandWrittenDryRun($sshconfig, "preview"))
			.command(withHandWrittenDryRun($sshgen, "preview"))
			.command(withHandWrittenDryRun($tcp, "preview"))
			.command(withHandWrittenDryRun($token, "preview"))
			.demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
