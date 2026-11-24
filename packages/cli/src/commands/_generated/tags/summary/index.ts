import $get from "./get.js";
/**
 * summary command group
 * @generated from apis/overlays/tags.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "summary",
	describe: "Operations for summary",

	routes: {
		get: $get,
	},
});

export default command;
