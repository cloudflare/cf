import $bulkdelete from "./bulk-delete.js";
import $bulkreplace from "./bulk-replace.js";
import $delete from "./delete.js";
import $get from "./get.js";
import $list from "./list.js";
import $regions from "./regions/index.js";
import $update from "./update.js";
/**
 * origin-cloud-regions command group
 * @generated from apis/overlays/cache.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "origin-cloud-regions",
	describe: "Manage Origin Cloud Regions routing and failover configurations",

	routes: {
		"bulk-delete": $bulkdelete,
		"bulk-replace": $bulkreplace,
		delete: $delete,
		get: $get,
		list: $list,
		update: $update,
		regions: $regions,
	},
});

export default command;
