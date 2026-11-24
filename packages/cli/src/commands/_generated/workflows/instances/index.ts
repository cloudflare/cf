import $batch from "./batch/index.js";
import $create from "./create.js";
import $delete from "./delete.js";
import $events from "./events/index.js";
import $get from "./get.js";
import $list from "./list.js";
import $pause from "./pause.js";
import $restart from "./restart.js";
import $resume from "./resume.js";
import $step from "./step/index.js";
import $terminate from "./terminate.js";
/**
 * instances command group
 * @generated from apis/overlays/workflows.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "instances",
	describe: "Workflow instance operations",

	routes: {
		create: $create,
		delete: $delete,
		get: $get,
		list: $list,
		pause: $pause,
		restart: $restart,
		resume: $resume,
		terminate: $terminate,
		batch: $batch,
		events: $events,
		step: $step,
	},
});

export default command;
