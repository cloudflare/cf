import $get from "./get.js";
import $list from "./list.js";
/**
 * stores command group
 * @generated from apis/overlays/secrets-store.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "stores",
	describe:
		"Secret stores that hold encrypted key-value secrets accessible by Workers and services",

	routes: {
		get: $get,
		list: $list,
	},
});

export default command;
