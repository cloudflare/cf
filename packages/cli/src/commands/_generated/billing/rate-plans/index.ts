import $get from "./get.js";
/**
 * rate-plans command group
 * @generated from apis/overlays/billing.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "rate-plans",
	describe: "Operations for rate-plans",

	routes: {
		get: $get,
	},
});

export default command;
