import $asn from "./asn/index.js";
/**
 * configs command group
 * @generated from apis/overlays/botnet-feed.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "configs",
	describe:
		"Botnet feed subscription configuration and notification preferences",

	routes: {
		asn: $asn,
	},
});

export default command;
