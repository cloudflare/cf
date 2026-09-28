import $agentreadiness from "./agent-readiness/index.js";
import $ai from "./ai/index.js";
import $annotations from "./annotations/index.js";
import $as112 from "./as112/index.js";
import $attacks from "./attacks/index.js";
import $bgp from "./bgp/index.js";
import $bots from "./bots/index.js";
import $ct from "./ct/index.js";
import $datasets from "./datasets/index.js";
import $dns from "./dns/index.js";
import $email from "./email/index.js";
import $entities from "./entities/index.js";
import $geolocations from "./geolocations/index.js";
import $http from "./http/index.js";
import $leakedcredentials from "./leaked-credentials/index.js";
import $netflows from "./netflows/index.js";
import $origins from "./origins/index.js";
import $postquantum from "./post-quantum/index.js";
import $quality from "./quality/index.js";
import $ranking from "./ranking/index.js";
import $robotstxt from "./robots-txt/index.js";
import $search from "./search/index.js";
import $tcpresetstimeouts from "./tcp-resets-timeouts/index.js";
import $tlds from "./tlds/index.js";
import $trafficanomalies from "./traffic-anomalies/index.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * radar command
 * @generated from apis/overlays/radar.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "radar",
	describe:
		"Internet-wide traffic intelligence — BGP, DNS, HTTP trends, attack data, and network quality insights",

	builder: (yargs) => {
		return yargs
			.command($agentreadiness)
			.command($ai)
			.command($annotations)
			.command($as112)
			.command($attacks)
			.command($bgp)
			.command($bots)
			.command($ct)
			.command($datasets)
			.command($dns)
			.command($email)
			.command($entities)
			.command($geolocations)
			.command($http)
			.command($leakedcredentials)
			.command($netflows)
			.command($origins)
			.command($postquantum)
			.command($quality)
			.command($ranking)
			.command($robotstxt)
			.command($search)
			.command($tcpresetstimeouts)
			.command($tlds)
			.command($trafficanomalies)
			.demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
