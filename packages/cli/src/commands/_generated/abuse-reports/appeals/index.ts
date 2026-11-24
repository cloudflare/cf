import $eligibility from "./eligibility.js";
/**
 * appeals command group
 * @generated from apis/overlays/abuse-reports.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "appeals",
	describe: "Appeal eligibility for abuse reports",

	routes: {
		eligibility: $eligibility,
	},
});

export default command;
