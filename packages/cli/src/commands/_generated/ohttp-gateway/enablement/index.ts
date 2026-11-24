import $create from "./create.js";
import $delete from "./delete.js";
import $get from "./get.js";
/**
 * enablement command group
 * @generated from apis/overlays/ohttp-gateway.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "enablement",
	describe: "Operations for enablement",

	routes: {
		create: $create,
		delete: $delete,
		get: $get,
	},
});

export default command;
