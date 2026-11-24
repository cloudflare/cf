import $create from "./create.js";
import $delete from "./delete.js";
import $federationgrants from "./federation-grants/index.js";
import $get from "./get.js";
import $list from "./list.js";
import $samlcertificate from "./saml-certificate/index.js";
import $scim from "./scim/index.js";
import $update from "./update.js";
/**
 * identity-providers command group
 * @generated from apis/overlays/zero-trust.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "identity-providers",
	describe: "Operations for identity-providers",

	routes: {
		create: $create,
		delete: $delete,
		get: $get,
		list: $list,
		update: $update,
		"federation-grants": $federationgrants,
		"saml-certificate": $samlcertificate,
		scim: $scim,
	},
});

export default command;
