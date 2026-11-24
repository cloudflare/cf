import $list from "./list.js";
/**
 * remediation-types command group
 * @generated from apis/overlays/zero-trust.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "remediation-types",
	describe: "Operations for casb.finding-types.remediation-types",

	routes: {
		list: $list,
	},
});

export default command;
