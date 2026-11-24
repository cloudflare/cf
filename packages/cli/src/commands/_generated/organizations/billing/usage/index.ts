import $get from "./get.js";
/**
 * usage command group
 * @generated from apis/overlays/organizations.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "usage",
	describe: "Operations for billing.usage",

	routes: {
		get: $get,
	},
});

export default command;
