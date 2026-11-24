import $get from "./get.js";
/**
 * context command group
 * @generated from apis/overlays/security-insights.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "context",
	describe: "Operations for context",

	routes: {
		get: $get,
	},
});

export default command;
