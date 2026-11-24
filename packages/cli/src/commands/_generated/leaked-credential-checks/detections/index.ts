import $create from "./create.js";
import $delete from "./delete.js";
import $get from "./get.js";
import $list from "./list.js";
import $update from "./update.js";
/**
 * detections command group
 * @generated from apis/overlays/leaked-credential-checks.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "detections",
	describe:
		"Custom detection locations that tell the WAF where to find usernames and passwords in requests",

	routes: {
		create: $create,
		delete: $delete,
		get: $get,
		list: $list,
		update: $update,
	},
});

export default command;
