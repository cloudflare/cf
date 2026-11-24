import $getconfiguration from "./get-configuration.js";
import $setconfiguration from "./set-configuration.js";
import $updateconfiguration from "./update-configuration.js";
/**
 * operator command group
 * @generated from apis/overlays/pay-per-use.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "operator",
	describe: "Operations for operator",

	routes: {
		"get-configuration": $getconfiguration,
		"set-configuration": $setconfiguration,
		"update-configuration": $updateconfiguration,
	},
});

export default command;
