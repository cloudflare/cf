import $allowpolicies from "./allow-policies/index.js";
import $analytics from "./analytics/index.js";
import $blocksenders from "./block-senders/index.js";
import $bulkactions from "./bulk-actions/index.js";
import $contentpolicies from "./content-policies/index.js";
import $domains from "./domains/index.js";
import $impersonationregistry from "./impersonation-registry/index.js";
import $investigate from "./investigate/index.js";
import $phishguard from "./phishguard/index.js";
import $sendingdomainrestrictions from "./sending-domain-restrictions/index.js";
import $submissions from "./submissions/index.js";
import $trusteddomains from "./trusted-domains/index.js";
import $urlignorepatterns from "./url-ignore-patterns/index.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * email-security command
 * @generated from apis/overlays/email-security.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "email-security",
	describe:
		"Cloud email security — investigate threats, manage allow/block policies, and detect phishing",

	builder: (yargs) => {
		return yargs
			.command($allowpolicies)
			.command($analytics)
			.command($blocksenders)
			.command($bulkactions)
			.command($contentpolicies)
			.command($domains)
			.command($impersonationregistry)
			.command($investigate)
			.command($phishguard)
			.command($sendingdomainrestrictions)
			.command($submissions)
			.command($trusteddomains)
			.command($urlignorepatterns)
			.demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
