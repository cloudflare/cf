import $list from "./list.js";
/**
 * shadow-hosts command group
 * @generated from apis/overlays/security-insights.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "shadow-hosts",
	describe: "Operations for partners.shadow-hosts",

	routes: {
		list: $list,
	},
});

export default command;
