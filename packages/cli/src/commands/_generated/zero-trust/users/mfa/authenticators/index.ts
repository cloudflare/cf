import $delete from "./delete.js";
/**
 * authenticators command group
 * @generated from apis/overlays/zero-trust.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "authenticators",
	describe: "Operations for users.mfa.authenticators",

	routes: {
		delete: $delete,
	},
});

export default command;
