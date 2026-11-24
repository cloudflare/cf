import $create from "./create.js";
import $delete from "./delete.js";
import $list from "./list.js";
/**
 * ssh-ca command group
 * @generated from apis/overlays/zero-trust.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "ssh-ca",
	describe: "Operations for access.infrastructure.ssh-ca",

	routes: {
		create: $create,
		delete: $delete,
		list: $list,
	},
});

export default command;
