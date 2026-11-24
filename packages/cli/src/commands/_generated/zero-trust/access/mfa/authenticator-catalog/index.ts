import $list from "./list.js";
/**
 * authenticator-catalog command group
 * @generated from apis/overlays/zero-trust.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "authenticator-catalog",
	describe: "Operations for access.mfa.authenticator-catalog",

	routes: {
		list: $list,
	},
});

export default command;
