import $accounttoolcallanalytics from "./account-tool-call-analytics.js";
import $create from "./create.js";
import $delete from "./delete.js";
import $list from "./list.js";
import $read from "./read.js";
import $toolcallanalytics from "./tool-call-analytics.js";
import $update from "./update.js";
/**
 * portals command group
 * @generated from apis/overlays/mcp.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "portals",
	describe: "Manage MCP portals, attached servers, and Code Mode settings",

	routes: {
		"account-tool-call-analytics": $accounttoolcallanalytics,
		create: $create,
		delete: $delete,
		list: $list,
		read: $read,
		"tool-call-analytics": $toolcallanalytics,
		update: $update,
	},
});

export default command;
