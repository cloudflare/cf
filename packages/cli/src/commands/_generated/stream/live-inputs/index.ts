import $create from "./create.js";
import $delete from "./delete.js";
import $disable from "./disable.js";
import $enable from "./enable.js";
import $get from "./get.js";
import $list from "./list.js";
import $outputs from "./outputs/index.js";
import $rotatekeys from "./rotate-keys.js";
import $update from "./update.js";
/**
 * live-inputs command group
 * @generated from apis/overlays/stream.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "live-inputs",
	describe: "Enable and disable live input streams",

	routes: {
		create: $create,
		delete: $delete,
		disable: $disable,
		enable: $enable,
		get: $get,
		list: $list,
		"rotate-keys": $rotatekeys,
		update: $update,
		outputs: $outputs,
	},
});

export default command;
