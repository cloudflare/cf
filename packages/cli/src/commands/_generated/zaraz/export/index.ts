import $get from "./get.js";
/**
 * export command group
 * @generated from apis/overlays/zaraz.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "export",
	describe:
		"Export the current Zaraz configuration as a portable JSON document",

	routes: {
		get: $get,
	},
});

export default command;
