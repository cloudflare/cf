import $getpem from "./get-pem.js";
import $get from "./get.js";
import $list from "./list.js";
import $rotate from "./rotate.js";
/**
 * saml-encryption-certificates command group
 * @generated from apis/overlays/zero-trust.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "saml-encryption-certificates",
	describe: "Operations for access.saml-encryption-certificates",

	routes: {
		get: $get,
		"get-pem": $getpem,
		list: $list,
		rotate: $rotate,
	},
});

export default command;
