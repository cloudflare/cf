import $activity from "./activity/index.js";
import $audit from "./audit/index.js";
import $create from "./create.js";
import $delete from "./delete.js";
import $get from "./get.js";
import $list from "./list.js";
import $update from "./update.js";
/**
 * spend-policies command group
 * @generated from apis/overlays/billing.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "spend-policies",
	describe: "Operations for spend-policies",

	routes: {
		create: $create,
		delete: $delete,
		get: $get,
		list: $list,
		update: $update,
		activity: $activity,
		audit: $audit,
	},
});

export default command;
