import $asset from "./as-set.js";
import $botnetthreatfeed from "./botnet-threat-feed.js";
import $get from "./get.js";
import $ip from "./ip.js";
import $list from "./list.js";
import $rel from "./rel.js";
/**
 * asns command group
 * @generated from apis/overlays/radar.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "asns",
	describe: "Operations for entities.asns",

	routes: {
		"as-set": $asset,
		"botnet-threat-feed": $botnetthreatfeed,
		get: $get,
		ip: $ip,
		list: $list,
		rel: $rel,
	},
});

export default command;
