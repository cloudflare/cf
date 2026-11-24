import $credentials from "./credentials/index.js";
import $delete from "./delete.js";
import $disable from "./disable.js";
import $enable from "./enable.js";
import $get from "./get.js";
import $list from "./list.js";
import $maintenanceconfigs from "./maintenance-configs/index.js";
import $namespaces from "./namespaces/index.js";
/**
 * basin-catalog command
 * @generated from apis/overlays/basin-catalog.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "basin-catalog",
	describe:
		"Iceberg-compatible data catalog for R2 — organize objects into tables and namespaces for SQL query engines",

	routes: {
		delete: $delete,
		disable: $disable,
		enable: $enable,
		get: $get,
		list: $list,
		credentials: $credentials,
		"maintenance-configs": $maintenanceconfigs,
		namespaces: $namespaces,
	},
});

export default command;
