import $list from "./list.js";
import $objects from "./objects/index.js";
/**
 * namespaces command group
 * @generated from apis/overlays/durable-objects.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "namespaces",
	describe:
		"List Durable Object namespaces and inspect individual object instances within them",

	routes: {
		list: $list,
		objects: $objects,
	},
});

export default command;
