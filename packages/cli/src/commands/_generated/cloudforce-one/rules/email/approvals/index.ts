import $replace from "./replace.js";
import $resubmit from "./resubmit.js";
/**
 * approvals command group
 * @generated from apis/overlays/cloudforce-one.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "approvals",
	describe:
		"Pending structured email rule approvals, which the original requester can revise",

	routes: {
		replace: $replace,
		resubmit: $resubmit,
	},
});

export default command;
