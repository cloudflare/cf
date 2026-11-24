import $create from "./create.js";
import $list from "./list.js";
/**
 * deployments command group
 * @generated from apis/overlays/ai-gateway.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "deployments",
	describe: "Deploy dynamic route versions and view deployment history",

	routes: {
		create: $create,
		list: $list,
	},
});

export default command;
