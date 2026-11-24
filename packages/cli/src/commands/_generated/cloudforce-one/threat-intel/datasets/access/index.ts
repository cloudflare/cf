import $groups from "./groups/index.js";
import $permissions from "./permissions/index.js";
/**
 * access command group
 * @generated from apis/overlays/cloudforce-one.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "access",
	describe: "Operations for threat-intel.datasets.access",

	routes: {
		groups: $groups,
		permissions: $permissions,
	},
});

export default command;
