import $create from "./create.js";
import $delete from "./delete.js";
import $get from "./get.js";
import $update from "./update.js";
/**
 * exemptions command group
 * @generated from apis/overlays/cloudforce-one.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "exemptions",
	describe: "Exemption rule operations",

	routes: {
		create: $create,
		delete: $delete,
		get: $get,
		update: $update,
	},
});

export default command;
