import $appeals from "./appeals/index.js";
import $create from "./create.js";
import $emails from "./emails/index.js";
import $getsubmitted from "./get-submitted.js";
import $get from "./get.js";
import $listsubmitted from "./list-submitted.js";
import $list from "./list.js";
import $mitigations from "./mitigations/index.js";
/**
 * abuse-reports command
 * @generated from apis/overlays/abuse-reports.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "abuse-reports",
	describe:
		"Submit and track abuse reports for phishing, malware, and other policy violations on Cloudflare-proxied sites",

	routes: {
		create: $create,
		get: $get,
		"get-submitted": $getsubmitted,
		list: $list,
		"list-submitted": $listsubmitted,
		appeals: $appeals,
		emails: $emails,
		mitigations: $mitigations,
	},
});

export default command;
