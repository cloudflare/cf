import $create from "./create.js";
import $delete from "./delete.js";
import $get from "./get.js";
import $legacycreate from "./legacy-create.js";
import $legacydelete from "./legacy-delete.js";
import $legacyget from "./legacy-get.js";
import $legacylist from "./legacy-list.js";
import $legacyupdate from "./legacy-update.js";
import $list from "./list.js";
import $sinks from "./sinks/index.js";
import $streams from "./streams/index.js";
import $updatetables from "./update-tables.js";
import $validatesql from "./validate-sql.js";
/**
 * pipelines command
 * @generated from apis/overlays/pipelines.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "pipelines",
	describe:
		"Ingest, transform, and route event streams into R2, analytics, or other destinations in real time",

	routes: {
		create: $create,
		delete: $delete,
		get: $get,
		"legacy-create": $legacycreate,
		"legacy-delete": $legacydelete,
		"legacy-get": $legacyget,
		"legacy-list": $legacylist,
		"legacy-update": $legacyupdate,
		list: $list,
		"update-tables": $updatetables,
		"validate-sql": $validatesql,
		sinks: $sinks,
		streams: $streams,
	},
});

export default command;
