import $delete from "./delete.js";
/**
 * passkeys command group
 * @generated from apis/overlays/zero-trust.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "passkeys",
	describe: "Operations for users.passkeys",

	routes: {
		delete: $delete,
	},
});

export default command;
