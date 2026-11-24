import $edit from "./edit.js";
import $get from "./get.js";
/**
 * dmarc-reports command group
 * @generated from apis/overlays/email-auth.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "dmarc-reports",
	describe: "Operations for dmarc-reports",

	routes: {
		edit: $edit,
		get: $get,
	},
});

export default command;
