import $listsubmitted from "./list-submitted.js";
import $list from "./list.js";
/**
 * emails command group
 * @generated from apis/overlays/abuse-reports.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "emails",
	describe: "Emails sent for abuse reports",

	routes: {
		list: $list,
		"list-submitted": $listsubmitted,
	},
});

export default command;
