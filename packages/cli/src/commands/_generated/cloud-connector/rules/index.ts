import $list from "./list.js";
import $update from "./update.js";
/**
 * rules command group
 * @generated from apis/overlays/cloud-connector.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "rules",
	describe:
		"Routing rules that map request patterns to cloud provider endpoints",

	routes: {
		list: $list,
		update: $update,
	},
});

export default command;
