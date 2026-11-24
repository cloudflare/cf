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
/**
 * radar command
 * @generated from apis/overlays/radar.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "radar",
	describe:
		"Internet-wide traffic intelligence — BGP, DNS, HTTP trends, attack data, and network quality insights",

	routes: {
		"agent-readiness": $agentreadiness,
		ai: $ai,
		annotations: $annotations,
		as112: $as112,
		attacks: $attacks,
		bgp: $bgp,
		bots: $bots,
		ct: $ct,
		datasets: $datasets,
		dns: $dns,
		email: $email,
		entities: $entities,
		geolocations: $geolocations,
		http: $http,
		"leaked-credentials": $leakedcredentials,
		netflows: $netflows,
		origins: $origins,
		"post-quantum": $postquantum,
		quality: $quality,
		ranking: $ranking,
		"robots-txt": $robotstxt,
		search: $search,
		"tcp-resets-timeouts": $tcpresetstimeouts,
		tlds: $tlds,
		"traffic-anomalies": $trafficanomalies,
	},
});

export default command;
