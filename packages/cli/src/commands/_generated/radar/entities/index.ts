import $asns from "./asns/index.js";
import $ips from "./ips/index.js";
import $locations from "./locations/index.js";
/**
 * entities command group
 * @generated from apis/overlays/radar.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "entities",
	describe:
		"Look up ASNs, IPs, domains, and locations with metadata and traffic summaries",

	routes: {
		asns: $asns,
		ips: $ips,
		locations: $locations,
	},
});

export default command;
