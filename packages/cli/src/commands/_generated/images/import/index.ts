import $abort from "./abort.js";
import $create from "./create.js";
import $delete from "./delete.js";
import $get from "./get.js";
import $list from "./list.js";
import $logs from "./logs.js";
import $progress from "./progress.js";
import $sources from "./sources/index.js";
import $start from "./start.js";
/**
 * import command group
 * @generated from apis/overlays/images.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "import",
	describe: "Import images from S3",

	routes: {
		abort: $abort,
		create: $create,
		delete: $delete,
		get: $get,
		list: $list,
		logs: $logs,
		progress: $progress,
		start: $start,
		sources: $sources,
	},
});

export default command;
