import $bulkcreate from "./bulk-create.js";
import $create from "./create.js";
import $delete from "./delete.js";
import $list from "./list.js";
import $update from "./update.js";
/**
 * rules command group
 * @generated from apis/overlays/rum.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "rules",
	describe:
		"Rules that control which pages and paths are tracked by Web Analytics",

	routes: {
		"bulk-create": $bulkcreate,
		create: $create,
		delete: $delete,
		list: $list,
		update: $update,
	},
});

export default command;
