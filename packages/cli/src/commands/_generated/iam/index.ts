import $permissiongroups from "./permission-groups/index.js";
import $resourcegroups from "./resource-groups/index.js";
import $sso from "./sso/index.js";
import $usergroups from "./user-groups/index.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * iam command
 * @generated from apis/overlays/iam.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "iam",
	describe:
		"Identity and access management — permission groups, resource groups, user groups, and SSO connectors",

	builder: (yargs) => {
		return yargs
			.command($permissiongroups)
			.command($resourcegroups)
			.command($sso)
			.command($usergroups)
			.demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
