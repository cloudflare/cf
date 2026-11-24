import $list from "./list.js";
/**
 * audit command group
 * @generated from apis/overlays/billing.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "audit",
	describe: "Operations for spend-policies.audit",

	routes: {
		list: $list,
	},
});

export default command;
