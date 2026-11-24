import $dnssec from "./dnssec/index.js";
import $edns from "./edns/index.js";
import $get from "./get.js";
import $ipversion from "./ip-version/index.js";
/**
 * locations command group
 * @generated from apis/overlays/radar.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "locations",
	describe: "Operations for as112.top.locations",

	routes: {
		get: $get,
		dnssec: $dnssec,
		edns: $edns,
		"ip-version": $ipversion,
	},
});

export default command;
