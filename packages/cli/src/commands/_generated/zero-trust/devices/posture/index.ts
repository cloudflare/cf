import $integrations from "./integrations/index.js";
import $rules from "./rules/index.js";
/**
 * posture command group
 * @generated from apis/overlays/zero-trust.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "posture",
	describe: "Operations for devices.posture",

	routes: {
		integrations: $integrations,
		rules: $rules,
	},
});

export default command;
