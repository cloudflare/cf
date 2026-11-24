import $create from "./create.js";
import $delete from "./delete.js";
import $get from "./get.js";
import $list from "./list.js";
import $update from "./update.js";
/**
 * apps command group
 * @generated from apis/overlays/spectrum.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "apps",
	describe:
		"Spectrum application configurations that map protocols and ports to origin servers",

	routes: {
		create: $create,
		delete: $delete,
		get: $get,
		list: $list,
		update: $update,
	},
});

export default command;
