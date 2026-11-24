import $domain from "./domain/index.js";
import $internetservices from "./internet-services/index.js";
import $timeseriesgroups from "./timeseries-groups.js";
import $top from "./top.js";
/**
 * ranking command group
 * @generated from apis/overlays/radar.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "ranking",
	describe:
		"Top domain rankings based on DNS query popularity across the Cloudflare network",

	routes: {
		"timeseries-groups": $timeseriesgroups,
		top: $top,
		domain: $domain,
		"internet-services": $internetservices,
	},
});

export default command;
