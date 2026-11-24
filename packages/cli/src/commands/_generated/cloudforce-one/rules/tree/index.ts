import $get from "./get.js";
/**
 * tree command group
 * @generated from apis/overlays/cloudforce-one.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "tree",
	describe: "Rule navigation tree operations",

	routes: {
		get: $get,
	},
});

export default command;
