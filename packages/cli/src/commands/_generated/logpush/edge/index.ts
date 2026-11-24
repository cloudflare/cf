import $create from "./create.js";
import $get from "./get.js";
/**
 * edge command group
 * @generated from apis/overlays/logpush.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "edge",
	describe: "Operations for edge",

	routes: {
		create: $create,
		get: $get,
	},
});

export default command;
