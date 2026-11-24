import $get from "./get.js";
import $update from "./update.js";
/**
 * behaviours command group
 * @generated from apis/overlays/zero-trust.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "behaviours",
	describe:
		"User Risk Scoring - manage behaviors used to calculate user risk scores",

	routes: {
		get: $get,
		update: $update,
	},
});

export default command;
