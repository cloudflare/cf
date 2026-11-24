import $get from "./get.js";
import $update from "./update.js";
/**
 * profile command group
 * @generated from apis/overlays/accounts.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "profile",
	describe: "View and manage the profile for a Cloudflare account",

	routes: {
		get: $get,
		update: $update,
	},
});

export default command;
