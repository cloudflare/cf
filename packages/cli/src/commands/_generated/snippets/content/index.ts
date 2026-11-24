import $get from "./get.js";
/**
 * content command group
 * @generated from apis/overlays/snippets.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "content",
	describe: "Operations for content",

	routes: {
		get: $get,
	},
});

export default command;
