import $list from "./list.js";
import $review from "./review.js";
/**
 * mitigations command group
 * @generated from apis/overlays/abuse-reports.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "mitigations",
	describe: "Mitigation actions taken in response to abuse reports",

	routes: {
		list: $list,
		review: $review,
	},
});

export default command;
