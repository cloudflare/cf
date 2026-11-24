import $list from "./list.js";
import $targetenvironments from "./target-environments/index.js";
/**
 * client-versions command group
 * @generated from apis/overlays/zero-trust.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "client-versions",
	describe: "Operations for devices.client-versions",

	routes: {
		list: $list,
		"target-environments": $targetenvironments,
	},
});

export default command;
