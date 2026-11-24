import $history from "./history.js";
import $list from "./list.js";
import $productcategories from "./product-categories.js";
/**
 * audit command group
 * @generated from apis/overlays/accounts.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "audit",
	describe: "Operations for logs.audit",

	routes: {
		history: $history,
		list: $list,
		"product-categories": $productcategories,
	},
});

export default command;
