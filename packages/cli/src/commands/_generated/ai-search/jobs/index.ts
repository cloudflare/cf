import $cancel from "./cancel.js";
import $create from "./create.js";
import $get from "./get.js";
import $list from "./list.js";
import $logs from "./logs.js";
/**
 * jobs command group
 * @generated from apis/overlays/ai-search.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "jobs",
	describe: "Indexing job lifecycle for AI Search instances",

	routes: {
		cancel: $cancel,
		create: $create,
		get: $get,
		list: $list,
		logs: $logs,
	},
});

export default command;
