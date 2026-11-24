import $mfa from "./mfa/index.js";
import $passkeys from "./passkeys/index.js";
/**
 * users command group
 * @generated from apis/overlays/zero-trust.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "users",
	describe: "Operations for users",

	routes: {
		mfa: $mfa,
		passkeys: $passkeys,
	},
});

export default command;
