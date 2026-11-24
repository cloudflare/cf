import $get from "./get.js";
/**
 * logs command group
 * @generated from apis/overlays/pages.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "logs",
	describe: "Operations for deployments.history.logs",

	routes: {
		get: $get,
	},
});

export default command;
