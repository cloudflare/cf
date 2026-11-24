import $get from "./get.js";
import $update from "./update.js";
/**
 * workflow command group
 * @generated from apis/overlays/zaraz.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "workflow",
	describe:
		"Workflow state for Zaraz configuration changes (draft vs. published)",

	routes: {
		get: $get,
		update: $update,
	},
});

export default command;
