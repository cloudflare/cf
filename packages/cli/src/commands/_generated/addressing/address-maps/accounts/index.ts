import $create from "./create.js";
import $delete from "./delete.js";
/**
 * accounts command group
 * @generated from apis/overlays/addressing.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "accounts",
	describe: "Operations for address-maps.accounts",

	routes: {
		create: $create,
		delete: $delete,
	},
});

export default command;
