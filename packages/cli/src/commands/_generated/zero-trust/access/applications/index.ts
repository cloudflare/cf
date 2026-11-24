import $create from "./create.js";
import $delete from "./delete.js";
import $get from "./get.js";
import $list from "./list.js";
import $policies from "./policies/index.js";
import $policytests from "./policy-tests/index.js";
import $revoketokens from "./revoke-tokens.js";
import $settings from "./settings/index.js";
import $shortlivedcertificates from "./short-lived-certificates/index.js";
import $update from "./update.js";
import $userpolicychecks from "./user-policy-checks/index.js";
/**
 * applications command group
 * @generated from apis/overlays/zero-trust.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "applications",
	describe: "Operations for access.applications",

	routes: {
		create: $create,
		delete: $delete,
		get: $get,
		list: $list,
		"revoke-tokens": $revoketokens,
		update: $update,
		policies: $policies,
		"policy-tests": $policytests,
		settings: $settings,
		"short-lived-certificates": $shortlivedcertificates,
		"user-policy-checks": $userpolicychecks,
	},
});

export default command;
