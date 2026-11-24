import $create from "./create.js";
import $delete from "./delete.js";
import $get from "./get.js";
/**
 * tenant-custom-nameservers command
 * @generated from apis/overlays/tenant-custom-nameservers.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "tenant-custom-nameservers",
	describe: "tenant-custom-nameservers",

	routes: {
		create: $create,
		delete: $delete,
		get: $get,
	},
});

export default command;
