import $backtests from "./backtests/index.js";
import $create from "./create.js";
import $delete from "./delete.js";
import $evaluations from "./evaluations/index.js";
import $list from "./list.js";
import $update from "./update.js";
/**
 * interests command group
 * @generated from apis/overlays/cloudforce-one.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "interests",
	describe: "Operations for priority-intelligence.interests",

	routes: {
		create: $create,
		delete: $delete,
		list: $list,
		update: $update,
		backtests: $backtests,
		evaluations: $evaluations,
	},
});

export default command;
