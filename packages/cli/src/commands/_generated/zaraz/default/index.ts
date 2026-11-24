import $get from "./get.js";
/**
 * default command group
 * @generated from apis/overlays/zaraz.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "default",
	describe:
		"Default Zaraz configuration template used as a starting point for new zones",

	routes: {
		get: $get,
	},
});

export default command;
