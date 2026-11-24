import $create from "./create.js";
/**
 * saml-certificate command group
 * @generated from apis/overlays/zero-trust.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "saml-certificate",
	describe: "Operations for identity-providers.saml-certificate",

	routes: {
		create: $create,
	},
});

export default command;
