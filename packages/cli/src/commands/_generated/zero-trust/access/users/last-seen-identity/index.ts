import $get from "./get.js";
/**
 * last-seen-identity command group
 * @generated from apis/overlays/zero-trust.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "last-seen-identity",
	describe: "Operations for access.users.last-seen-identity",

	routes: {
		get: $get,
	},
});

export default command;
