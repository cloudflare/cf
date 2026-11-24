import $create from "./create.js";
import $get from "./get.js";
import $list from "./list.js";
/**
 * versions command group
 * @generated from apis/overlays/ai-gateway.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "versions",
	describe: "Create and inspect saved versions of a dynamic route",

	routes: {
		create: $create,
		get: $get,
		list: $list,
	},
});

export default command;
