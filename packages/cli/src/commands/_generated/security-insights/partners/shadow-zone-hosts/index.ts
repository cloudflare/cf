import $list from "./list.js";
/**
 * shadow-zone-hosts command group
 * @generated from apis/overlays/security-insights.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "shadow-zone-hosts",
	describe: "Operations for partners.shadow-zone-hosts",

	routes: {
		list: $list,
	},
});

export default command;
