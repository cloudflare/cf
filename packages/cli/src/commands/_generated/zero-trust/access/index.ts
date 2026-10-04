import $applications from "./applications/index.js";
import $custompages from "./custom-pages/index.js";
import $infrastructure from "./infrastructure/index.js";
import $logs from "./logs/index.js";
import $mfa from "./mfa/index.js";
import $mtlscertificates from "./mtls-certificates/index.js";
import $policies from "./policies/index.js";
import $rulegroups from "./rule-groups/index.js";
import $samlencryptioncertificates from "./saml-encryption-certificates/index.js";
import $servicetokens from "./service-tokens/index.js";
import $signingkeys from "./signing-keys/index.js";
import $tags from "./tags/index.js";
import $targets from "./targets/index.js";
import $userpopulations from "./user-populations/index.js";
import $users from "./users/index.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * access command group
 * @generated from apis/overlays/zero-trust.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "access",
	describe: "Operations for access",

	builder: (yargs) => {
		return yargs
			.command($applications)
			.command($custompages)
			.command($infrastructure)
			.command($logs)
			.command($mfa)
			.command($mtlscertificates)
			.command($policies)
			.command($rulegroups)
			.command($samlencryptioncertificates)
			.command($servicetokens)
			.command($signingkeys)
			.command($tags)
			.command($targets)
			.command($userpopulations)
			.command($users)
			.demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
