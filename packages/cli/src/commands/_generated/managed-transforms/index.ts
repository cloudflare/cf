import $delete from "./delete.js";
import $list from "./list.js";
import $update from "./update.js";
/**
 * managed-transforms command
 * @generated from apis/overlays/managed-transforms.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "managed-transforms",
	describe: "managed-transforms",

	routes: {
		delete: $delete,
		list: $list,
		update: $update,
	},
});

export default command;
