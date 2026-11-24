import $get from "./get.js";
/**
 * logs command group
 * @generated from apis/overlays/artifacts.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "logs",
	describe: "Operations for namespaces.repos.logs",

	routes: {
		get: $get,
	},
});

export default command;
