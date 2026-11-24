import $acls from "./acls/index.js";
import $forceaxfr from "./force-axfr.js";
import $incoming from "./incoming/index.js";
import $outgoing from "./outgoing/index.js";
import $peers from "./peers/index.js";
import $tsigs from "./tsigs/index.js";
/**
 * zone-transfers command group
 * @generated from apis/overlays/dns.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "zone-transfers",
	describe: "Operations for zone-transfers",

	routes: {
		"force-axfr": $forceaxfr,
		acls: $acls,
		incoming: $incoming,
		outgoing: $outgoing,
		peers: $peers,
		tsigs: $tsigs,
	},
});

export default command;
