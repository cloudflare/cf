import $getcanbeenabled from "./get-can-be-enabled.js";
import $getconfiguration from "./get-configuration.js";
import $setcanbeenabled from "./set-can-be-enabled.js";
import $updateconfiguration from "./update-configuration.js";
/**
 * zones command group
 * @generated from apis/overlays/pay-per-use.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "zones",
	describe: "Operations for zones",

	routes: {
		"get-can-be-enabled": $getcanbeenabled,
		"get-configuration": $getconfiguration,
		"set-can-be-enabled": $setcanbeenabled,
		"update-configuration": $updateconfiguration,
	},
});

export default command;
