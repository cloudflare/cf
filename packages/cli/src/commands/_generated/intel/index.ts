import $asn from "./asn/index.js";
import $attacksurfacereport from "./attack-surface-report/index.js";
import $dns from "./dns/index.js";
import $domainhistory from "./domain-history/index.js";
import $domains from "./domains/index.js";
import $indicatorfeeds from "./indicator-feeds/index.js";
import $iplists from "./ip-lists/index.js";
import $ips from "./ips/index.js";
import $miscategorizations from "./miscategorizations/index.js";
import $sinkholes from "./sinkholes/index.js";
import $urls from "./urls/index.js";
import $whois from "./whois/index.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * intel command
 * @generated from apis/overlays/intel.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "intel",
	describe:
		"Threat intelligence lookups — IP reputation, domain info, ASN details, WHOIS, and indicator feeds",

	builder: (yargs) => {
		return yargs
			.command($asn)
			.command($attacksurfacereport)
			.command($dns)
			.command($domainhistory)
			.command($domains)
			.command($indicatorfeeds)
			.command($iplists)
			.command($ips)
			.command($miscategorizations)
			.command($sinkholes)
			.command($urls)
			.command($whois)
			.demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
