import $delete from "./delete.js";
import $get from "./get.js";
import $update from "./update.js";
/**
 * security-txt command
 * @generated from apis/overlays/security-txt.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "security-txt",
	describe:
		"Manage the /.well-known/security.txt file that tells security researchers how to report vulnerabilities",

	routes: {
		delete: $delete,
		get: $get,
		update: $update,
	},
});

export default command;
