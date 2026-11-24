import $create from "./create.js";
import $delete from "./delete.js";
import $get from "./get.js";
import $list from "./list.js";
/**
 * custom-domains command group
 * @generated from apis/overlays/ai-gateway.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "custom-domains",
	describe: "Manage custom hostnames that route requests through an AI Gateway",

	routes: {
		create: $create,
		delete: $delete,
		get: $get,
		list: $list,
	},
});

export default command;
