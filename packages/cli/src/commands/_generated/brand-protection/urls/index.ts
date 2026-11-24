import $get from "./get.js";
import $submit from "./submit.js";
/**
 * urls command group
 * @generated from apis/overlays/brand-protection.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "urls",
	describe: "Operations for urls",

	routes: {
		get: $get,
		submit: $submit,
	},
});

export default command;
