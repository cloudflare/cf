import $delete from "./delete.js";
import $getrequest from "./get-request.js";
import $getresponse from "./get-response.js";
import $get from "./get.js";
import $list from "./list.js";
import $update from "./update.js";
/**
 * logs command group
 * @generated from apis/overlays/ai-gateway.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "logs",
	describe:
		"Inspect, annotate, and delete gateway request logs stored by Legacy Logs",

	routes: {
		delete: $delete,
		get: $get,
		"get-request": $getrequest,
		"get-response": $getresponse,
		list: $list,
		update: $update,
	},
});

export default command;
