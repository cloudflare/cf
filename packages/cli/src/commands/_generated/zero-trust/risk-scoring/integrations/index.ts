import $create from "./create.js";
import $delete from "./delete.js";
import $get from "./get.js";
import $list from "./list.js";
import $references from "./references/index.js";
import $update from "./update.js";
/**
 * integrations command group
 * @generated from apis/overlays/zero-trust.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "integrations",
	describe:
		"User Risk Scoring - manage integrations that provide risk score signals",

	routes: {
		create: $create,
		delete: $delete,
		get: $get,
		list: $list,
		update: $update,
		references: $references,
	},
});

export default command;
