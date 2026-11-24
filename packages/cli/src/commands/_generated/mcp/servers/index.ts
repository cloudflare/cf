import $create from "./create.js";
import $delete from "./delete.js";
import $list from "./list.js";
import $read from "./read.js";
import $sync from "./sync.js";
import $toolcallanalytics from "./tool-call-analytics.js";
import $update from "./update.js";
/**
 * servers command group
 * @generated from apis/overlays/mcp.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "servers",
	describe:
		"Manage upstream MCP servers, credentials, capabilities, and sync state",

	routes: {
		create: $create,
		delete: $delete,
		list: $list,
		read: $read,
		sync: $sync,
		"tool-call-analytics": $toolcallanalytics,
		update: $update,
	},
});

export default command;
