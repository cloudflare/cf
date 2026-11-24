import $create from "./create.js";
import $delete from "./delete.js";
import $get from "./get.js";
import $list from "./list.js";
import $refresh from "./refresh.js";
import $rotate from "./rotate.js";
import $update from "./update.js";
/**
 * service-tokens command group
 * @generated from apis/overlays/zero-trust.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "service-tokens",
	describe: "Operations for access.service-tokens",

	routes: {
		create: $create,
		delete: $delete,
		get: $get,
		list: $list,
		refresh: $refresh,
		rotate: $rotate,
		update: $update,
	},
});

export default command;
