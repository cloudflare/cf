import $bulkedit from "./bulk-edit.js";
import $create from "./create.js";
import $delete from "./delete.js";
import $edit from "./edit.js";
import $get from "./get.js";
import $health from "./health/index.js";
import $list from "./list.js";
import $references from "./references/index.js";
import $update from "./update.js";
/**
 * pools command group
 * @generated from apis/overlays/load-balancers.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "pools",
	describe:
		"Origin server pools with weighted traffic distribution, health thresholds, and geographic preferences",

	routes: {
		"bulk-edit": $bulkedit,
		create: $create,
		delete: $delete,
		edit: $edit,
		get: $get,
		list: $list,
		update: $update,
		health: $health,
		references: $references,
	},
});

export default command;
