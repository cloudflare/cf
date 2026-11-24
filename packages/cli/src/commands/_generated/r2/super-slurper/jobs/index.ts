import $abortall from "./abort-all.js";
import $abort from "./abort.js";
import $create from "./create.js";
import $delete from "./delete.js";
import $get from "./get.js";
import $list from "./list.js";
import $logs from "./logs/index.js";
import $pause from "./pause.js";
import $progress from "./progress.js";
import $resume from "./resume.js";
/**
 * jobs command group
 * @generated from apis/overlays/r2.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "jobs",
	describe: "Operations for super-slurper.jobs",

	routes: {
		abort: $abort,
		"abort-all": $abortall,
		create: $create,
		delete: $delete,
		get: $get,
		list: $list,
		pause: $pause,
		progress: $progress,
		resume: $resume,
		logs: $logs,
	},
});

export default command;
