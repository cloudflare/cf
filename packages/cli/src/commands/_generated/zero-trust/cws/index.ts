import $basicauthcredentials from "./basic-auth-credentials/index.js";
import $deployments from "./deployments/index.js";
import $domainacls from "./domain-acls/index.js";
import $policies from "./policies/index.js";
import $policysets from "./policy-sets/index.js";
import $regometadata from "./rego-metadata/index.js";
import $regomodules from "./rego-modules/index.js";
import $tenantstructures from "./tenant-structures/index.js";
import $workloads from "./workloads/index.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * cws command group
 * @generated from apis/overlays/zero-trust.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "cws",
	describe: "Operations for cws",

	builder: (yargs) => {
		return yargs
			.command($basicauthcredentials)
			.command($deployments)
			.command($domainacls)
			.command($policies)
			.command($policysets)
			.command($regometadata)
			.command($regomodules)
			.command($tenantstructures)
			.command($workloads)
			.demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
