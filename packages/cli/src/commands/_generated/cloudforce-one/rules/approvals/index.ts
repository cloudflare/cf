import $cancel from "./cancel.js";
import $get from "./get.js";
import $list from "./list.js";
import $resubmit from "./resubmit.js";
/**
 * approvals command group
 * @generated from apis/overlays/cloudforce-one.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "approvals",
	describe: "Approval workflow operations",

	routes: {
		cancel: $cancel,
		get: $get,
		list: $list,
		resubmit: $resubmit,
	},
});

export default command;
