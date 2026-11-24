import $get from "./get.js";
import $update from "./update.js";
/**
 * profile command group
 * @generated from apis/overlays/organizations.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "profile",
	describe:
		"View and update the public profile information for an organization",

	routes: {
		get: $get,
		update: $update,
	},
});

export default command;
