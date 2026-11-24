import $create from "./create.js";
import $delete from "./delete.js";
import $get from "./get.js";
/**
 * logos command group
 * @generated from apis/overlays/brand-protection.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "logos",
	describe: "Operations for logos",

	routes: {
		create: $create,
		delete: $delete,
		get: $get,
	},
});

export default command;
