import $getsignaturelink from "./get-signature-link.js";
import $getsignature from "./get-signature.js";
import $get from "./get.js";
import $sendsignatureevent from "./send-signature-event.js";
/**
 * terms command group
 * @generated from apis/overlays/pay-per-crawl.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "terms",
	describe: "Operations for terms",

	routes: {
		get: $get,
		"get-signature": $getsignature,
		"get-signature-link": $getsignaturelink,
		"send-signature-event": $sendsignatureevent,
	},
});

export default command;
