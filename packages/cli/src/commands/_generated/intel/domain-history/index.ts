import $get from "./get.js";
/**
 * domain-history command group
 * @generated from apis/overlays/intel.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "domain-history",
	describe:
		"Historical domain registration and categorization changes over time",

	routes: {
		get: $get,
	},
});

export default command;
