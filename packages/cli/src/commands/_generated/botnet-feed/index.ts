import $asn from "./asn/index.js";
import $configs from "./configs/index.js";
/**
 * botnet-feed command
 * @generated from apis/overlays/botnet-feed.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "botnet-feed",
	describe:
		"Botnet threat intelligence feeds — IP and ASN-level data on known command-and-control infrastructure",

	routes: {
		asn: $asn,
		configs: $configs,
	},
});

export default command;
