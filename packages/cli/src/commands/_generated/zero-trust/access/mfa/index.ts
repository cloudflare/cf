import $authenticatorcatalog from "./authenticator-catalog/index.js";
/**
 * mfa command group
 * @generated from apis/overlays/zero-trust.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "mfa",
	describe: "Operations for access.mfa",

	routes: {
		"authenticator-catalog": $authenticatorcatalog,
	},
});

export default command;
