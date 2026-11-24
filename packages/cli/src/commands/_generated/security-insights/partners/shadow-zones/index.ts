import $list from "./list.js";
/**
 * shadow-zones command group
 * @generated from apis/overlays/security-insights.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "shadow-zones",
	describe: "Operations for partners.shadow-zones",

	routes: {
		list: $list,
	},
});

export default command;
