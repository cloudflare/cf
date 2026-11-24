import $getcanbeenabled from "./get-can-be-enabled.js";
import $querycanbeenabled from "./query-can-be-enabled.js";
import $setcanbeenabled from "./set-can-be-enabled.js";
/**
 * zones command group
 * @generated from apis/overlays/pay-per-crawl.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "zones",
	describe: "Operations for zones",

	routes: {
		"get-can-be-enabled": $getcanbeenabled,
		"query-can-be-enabled": $querycanbeenabled,
		"set-can-be-enabled": $setcanbeenabled,
	},
});

export default command;
