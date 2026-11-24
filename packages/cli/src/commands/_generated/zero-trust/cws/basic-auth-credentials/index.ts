import $create from "./create.js";
import $delete from "./delete.js";
import $get from "./get.js";
import $list from "./list.js";
import $secrets from "./secrets/index.js";
/**
 * basic-auth-credentials command group
 * @generated from apis/overlays/zero-trust.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "basic-auth-credentials",
	describe: "Operations for cws.basic-auth-credentials",

	routes: {
		create: $create,
		delete: $delete,
		get: $get,
		list: $list,
		secrets: $secrets,
	},
});

export default command;
