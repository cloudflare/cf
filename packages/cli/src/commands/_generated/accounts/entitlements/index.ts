import $get from "./get.js";
/**
 * entitlements command group
 * @generated from apis/overlays/accounts.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "entitlements",
	describe: "Operations for entitlements",

	routes: {
		get: $get,
	},
});

export default command;
