import $bulkedit from "./bulk-edit.js";
import $edit from "./edit.js";
import $get from "./get.js";
import $list from "./list.js";
/**
 * operations command group
 * @generated from apis/overlays/web-assets.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "operations",
	describe: "Operations for discovery.operations",

	routes: {
		"bulk-edit": $bulkedit,
		edit: $edit,
		get: $get,
		list: $list,
	},
});

export default command;
