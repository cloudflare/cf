import $submit from "./submit.js";
/**
 * usage-reports command group
 * @generated from apis/overlays/pay-per-use.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "usage-reports",
	describe: "Operations for usage-reports",

	routes: {
		submit: $submit,
	},
});

export default command;
