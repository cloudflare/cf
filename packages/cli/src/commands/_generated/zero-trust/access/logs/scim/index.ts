import $updates from "./updates/index.js";
/**
 * scim command group
 * @generated from apis/overlays/zero-trust.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "scim",
	describe: "Operations for access.logs.scim",

	routes: {
		updates: $updates,
	},
});

export default command;
