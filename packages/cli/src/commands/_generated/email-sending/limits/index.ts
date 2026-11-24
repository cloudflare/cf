import $get from "./get.js";
/**
 * limits command group
 * @generated from apis/overlays/email-sending.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "limits",
	describe: "Inspect account-level sending quotas and current usage",

	routes: {
		get: $get,
	},
});

export default command;
