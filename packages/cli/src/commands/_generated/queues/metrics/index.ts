import $get from "./get.js";
/**
 * metrics command group
 * @generated from apis/overlays/queues.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "metrics",
	describe: "Operations for metrics",

	routes: {
		get: $get,
	},
});

export default command;
