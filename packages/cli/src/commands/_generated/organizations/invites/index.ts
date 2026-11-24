import $update from "./update.js";
/**
 * invites command group
 * @generated from apis/overlays/organizations.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "invites",
	describe: "Invitations to join an organization",

	routes: {
		update: $update,
	},
});

export default command;
