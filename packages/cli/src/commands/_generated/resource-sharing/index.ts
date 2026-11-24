import $create from "./create.js";
import $delete from "./delete.js";
import $excludedrecipients from "./excluded-recipients/index.js";
import $get from "./get.js";
import $list from "./list.js";
import $recipients from "./recipients/index.js";
import $resources from "./resources/index.js";
import $update from "./update.js";
/**
 * resource-sharing command
 * @generated from apis/overlays/resource-sharing.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "resource-sharing",
	describe:
		"Share account-level resources (WAF custom rulesets, Gateway policies and settings, Access IdP federation grants) with other accounts in the same organization",

	routes: {
		create: $create,
		delete: $delete,
		get: $get,
		list: $list,
		update: $update,
		"excluded-recipients": $excludedrecipients,
		recipients: $recipients,
		resources: $resources,
	},
});

export default command;
