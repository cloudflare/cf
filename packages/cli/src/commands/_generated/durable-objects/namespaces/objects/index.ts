import $list from "./list.js";
/**
 * objects command group
 * @generated from apis/overlays/durable-objects.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "objects",
	describe: "List Durable Object instances in a namespace",

	routes: {
		list: $list,
	},
});

export default command;
