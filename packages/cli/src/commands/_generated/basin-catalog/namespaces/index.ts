import $list from "./list.js";
import $tables from "./tables/index.js";
/**
 * namespaces command group
 * @generated from apis/overlays/basin-catalog.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "namespaces",
	describe:
		"Logical namespaces that group related tables within the data catalog",

	routes: {
		list: $list,
		tables: $tables,
	},
});

export default command;
