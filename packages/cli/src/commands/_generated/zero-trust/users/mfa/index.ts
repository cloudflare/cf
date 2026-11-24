import $authenticators from "./authenticators/index.js";
/**
 * mfa command group
 * @generated from apis/overlays/zero-trust.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "mfa",
	describe: "Operations for users.mfa",

	routes: {
		authenticators: $authenticators,
	},
});

export default command;
