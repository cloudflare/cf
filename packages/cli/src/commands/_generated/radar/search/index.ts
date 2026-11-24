import $global from "./global.js";
/**
 * search command group
 * @generated from apis/overlays/radar.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "search",
	describe: "Search Radar data across IPs, ASNs, domains, and locations",

	routes: {
		global: $global,
	},
});

export default command;
