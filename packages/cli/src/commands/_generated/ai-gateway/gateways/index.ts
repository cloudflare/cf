import $create from "./create.js";
import $delete from "./delete.js";
import $geturl from "./get-url.js";
import $get from "./get.js";
import $list from "./list.js";
import $providers from "./providers/index.js";
import $update from "./update.js";
/**
 * gateways command group
 * @generated from apis/overlays/ai-gateway.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "gateways",
	describe: "Create and configure AI Gateways for an account",

	routes: {
		create: $create,
		delete: $delete,
		get: $get,
		"get-url": $geturl,
		list: $list,
		update: $update,
		providers: $providers,
	},
});

export default command;
