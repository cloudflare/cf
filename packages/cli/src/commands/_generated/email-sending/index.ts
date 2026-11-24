import $get from "./get.js";
import $limits from "./limits/index.js";
import $reputation from "./reputation/index.js";
import $sendraw from "./send-raw.js";
import $send from "./send.js";
import $subdomains from "./subdomains/index.js";
import $suppressions from "./suppressions/index.js";
/**
 * email-sending command
 * @generated from apis/overlays/email-sending.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "email-sending",
	describe:
		"Send transactional email and manage sending subdomains and their DNS configuration",

	routes: {
		get: $get,
		send: $send,
		"send-raw": $sendraw,
		limits: $limits,
		reputation: $reputation,
		subdomains: $subdomains,
		suppressions: $suppressions,
	},
});

export default command;
