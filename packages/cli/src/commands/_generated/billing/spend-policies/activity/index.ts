import $list from "./list.js";
/**
 * activity command group
 * @generated from apis/overlays/billing.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "activity",
	describe: "Operations for spend-policies.activity",

	routes: {
		list: $list,
	},
});

export default command;
