import $create from "./create.js";
import $delete from "./delete.js";
import $evaluateexisting from "./evaluate-existing.js";
import $evaluate from "./evaluate.js";
import $get from "./get.js";
import $jobs from "./jobs/index.js";
import $list from "./list.js";
import $update from "./update.js";
/**
 * webhooks command group
 * @generated from apis/overlays/zero-trust.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "webhooks",
	describe: "Operations for casb.webhooks",

	routes: {
		create: $create,
		delete: $delete,
		evaluate: $evaluate,
		"evaluate-existing": $evaluateexisting,
		get: $get,
		list: $list,
		update: $update,
		jobs: $jobs,
	},
});

export default command;
