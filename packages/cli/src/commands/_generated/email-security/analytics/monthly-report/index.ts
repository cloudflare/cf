import $get from "./get.js";
/**
 * monthly-report command group
 * @generated from apis/overlays/email-security.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "monthly-report",
	describe: "Operations for analytics.monthly-report",

	routes: {
		get: $get,
	},
});

export default command;
