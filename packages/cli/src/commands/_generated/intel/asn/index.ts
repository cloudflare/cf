import $get from "./get.js";
import $subnets from "./subnets/index.js";
/**
 * asn command group
 * @generated from apis/overlays/intel.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "asn",
	describe:
		"ASN intelligence — ownership, geolocation, and subnet details for autonomous systems",

	routes: {
		get: $get,
		subnets: $subnets,
	},
});

export default command;
