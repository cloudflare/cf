import $list from "./list.js";
/**
 * limits command group
 * @generated from apis/overlays/zero-trust.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "limits",
	describe: "Data Loss Prevention - view account limits and resource quotas",

	routes: {
		list: $list,
	},
});

export default command;
