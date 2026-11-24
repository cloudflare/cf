import $create from "./create.js";
import $delete from "./delete.js";
import $deployments from "./deployments/index.js";
import $get from "./get.js";
import $list from "./list.js";
import $update from "./update.js";
import $versions from "./versions/index.js";
/**
 * dynamic-routing command group
 * @generated from apis/overlays/ai-gateway.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "dynamic-routing",
	describe:
		"Route requests across multiple AI providers with fallback, load-balancing, and versioned deployments",

	routes: {
		create: $create,
		delete: $delete,
		get: $get,
		list: $list,
		update: $update,
		deployments: $deployments,
		versions: $versions,
	},
});

export default command;
