import $get from "./get.js";
/**
 * summary command group
 * @generated from apis/overlays/zero-trust.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "summary",
	describe: "User Risk Scoring - retrieve account risk score summaries",

	routes: {
		get: $get,
	},
});

export default command;
