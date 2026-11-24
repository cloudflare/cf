import $get from "./get.js";
import $rotateseed from "./rotate-seed.js";
import $update from "./update.js";
/**
 * audit-ssh-settings command group
 * @generated from apis/overlays/zero-trust.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "audit-ssh-settings",
	describe: "Operations for access.infrastructure.audit-ssh-settings",

	routes: {
		get: $get,
		"rotate-seed": $rotateseed,
		update: $update,
	},
});

export default command;
