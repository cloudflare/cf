import $get from "./get.js";
/**
 * verification command group
 * @generated from apis/overlays/email-security.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "verification",
	describe: "Operations for domains.verification",

	routes: {
		get: $get,
	},
});

export default command;
