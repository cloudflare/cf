import $bulkdelete from "./bulk-delete.js";
import $create from "./create.js";
import $list from "./list.js";
import $prefix from "./prefix/index.js";
/**
 * allowlist command group
 * @generated from apis/overlays/magic-transit.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "allowlist",
	describe: "Operations for advanced-tcp-protection.configs.allowlist",

	routes: {
		"bulk-delete": $bulkdelete,
		create: $create,
		list: $list,
		prefix: $prefix,
	},
});

export default command;
