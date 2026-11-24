import $clear from "./clear.js";
import $edit from "./edit.js";
import $get from "./get.js";
import $status from "./status.js";
/**
 * reserve command group
 * @generated from apis/overlays/cache.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "reserve",
	describe:
		"Persistent storage tier that keeps cached assets even after eviction from edge caches",

	routes: {
		clear: $clear,
		edit: $edit,
		get: $get,
		status: $status,
	},
});

export default command;
