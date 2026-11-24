import $auditsshsettings from "./audit-ssh-settings/index.js";
import $sshca from "./ssh-ca/index.js";
/**
 * infrastructure command group
 * @generated from apis/overlays/zero-trust.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "infrastructure",
	describe: "Operations for access.infrastructure",

	routes: {
		"audit-ssh-settings": $auditsshsettings,
		"ssh-ca": $sshca,
	},
});

export default command;
