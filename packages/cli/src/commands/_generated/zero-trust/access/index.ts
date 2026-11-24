import $applications from "./applications/index.js";
import $custompages from "./custom-pages/index.js";
import $infrastructure from "./infrastructure/index.js";
import $logs from "./logs/index.js";
import $mfa from "./mfa/index.js";
import $mtlscertificates from "./mtls-certificates/index.js";
import $policies from "./policies/index.js";
import $rulegroups from "./rule-groups/index.js";
import $samlencryptioncertificates from "./saml-encryption-certificates/index.js";
import $servicetokens from "./service-tokens/index.js";
import $signingkeys from "./signing-keys/index.js";
import $tags from "./tags/index.js";
import $targets from "./targets/index.js";
import $userpopulations from "./user-populations/index.js";
import $users from "./users/index.js";
/**
 * access command group
 * @generated from apis/overlays/zero-trust.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "access",
	describe: "Operations for access",

	routes: {
		applications: $applications,
		"custom-pages": $custompages,
		infrastructure: $infrastructure,
		logs: $logs,
		mfa: $mfa,
		"mtls-certificates": $mtlscertificates,
		policies: $policies,
		"rule-groups": $rulegroups,
		"saml-encryption-certificates": $samlencryptioncertificates,
		"service-tokens": $servicetokens,
		"signing-keys": $signingkeys,
		tags: $tags,
		targets: $targets,
		"user-populations": $userpopulations,
		users: $users,
	},
});

export default command;
