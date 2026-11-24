import $create from "./create.js";
import $delete from "./delete.js";
import $update from "./update.js";
/**
 * custom command group
 * @generated from apis/overlays/zero-trust.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "custom",
	describe: "Data Loss Prevention - manage custom profiles",

	routes: {
		create: $create,
		delete: $delete,
		update: $update,
	},
});

export default command;
