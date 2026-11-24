import $create from "./create.js";
import $delete from "./delete.js";
import $get from "./get.js";
/**
 * schedule command group
 * @generated from apis/overlays/speed.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "schedule",
	describe:
		"Scheduled recurring speed tests that automatically run at regular intervals",

	routes: {
		create: $create,
		delete: $delete,
		get: $get,
	},
});

export default command;
