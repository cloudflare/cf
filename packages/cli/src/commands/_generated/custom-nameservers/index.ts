import $create from "./create.js";
import $delete from "./delete.js";
import $get from "./get.js";
/**
 * custom-nameservers command
 * @generated from apis/overlays/custom-nameservers.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "custom-nameservers",
	describe: "custom-nameservers",

	routes: {
		create: $create,
		delete: $delete,
		get: $get,
	},
});

export default command;
