import $associations from "./associations/index.js";
import $create from "./create.js";
import $delete from "./delete.js";
import $get from "./get.js";
import $list from "./list.js";
/**
 * mtls-certificates command group
 * @generated from apis/overlays/ssl.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "mtls-certificates",
	describe: "Operations for mtls-certificates",

	routes: {
		create: $create,
		delete: $delete,
		get: $get,
		list: $list,
		associations: $associations,
	},
});

export default command;
