import $basicauthcredentials from "./basic-auth-credentials/index.js";
import $deployments from "./deployments/index.js";
import $domainacls from "./domain-acls/index.js";
import $policies from "./policies/index.js";
import $policysets from "./policy-sets/index.js";
import $regometadata from "./rego-metadata/index.js";
import $regomodules from "./rego-modules/index.js";
import $tenantstructures from "./tenant-structures/index.js";
import $workloads from "./workloads/index.js";
/**
 * cws command group
 * @generated from apis/overlays/zero-trust.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "cws",
	describe: "Operations for cws",

	routes: {
		"basic-auth-credentials": $basicauthcredentials,
		deployments: $deployments,
		"domain-acls": $domainacls,
		policies: $policies,
		"policy-sets": $policysets,
		"rego-metadata": $regometadata,
		"rego-modules": $regomodules,
		"tenant-structures": $tenantstructures,
		workloads: $workloads,
	},
});

export default command;
