import $get from "./get.js";
import $malicious from "./malicious/index.js";
import $spam from "./spam/index.js";
import $spoof from "./spoof/index.js";
/**
 * tlds command group
 * @generated from apis/overlays/radar.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "tlds",
	describe: "Operations for email.security.top.tlds",

	routes: {
		get: $get,
		malicious: $malicious,
		spam: $spam,
		spoof: $spoof,
	},
});

export default command;
