import $create from "./create.js";
import $delete from "./delete.js";
import $get from "./get.js";
import $list from "./list.js";
import $pause from "./pause.js";
import $resume from "./resume.js";
import $update from "./update.js";
/**
 * integrations command group
 * @generated from apis/overlays/zero-trust.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "integrations",
	describe: "Operations for casb.integrations",

	routes: {
		create: $create,
		delete: $delete,
		get: $get,
		list: $list,
		pause: $pause,
		resume: $resume,
		update: $update,
	},
});

export default command;
