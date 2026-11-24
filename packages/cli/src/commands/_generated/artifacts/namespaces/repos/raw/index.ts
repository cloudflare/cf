import $get from "./get.js";
/**
 * raw command group
 * @generated from apis/overlays/artifacts.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "raw",
	describe: "Operations for namespaces.repos.raw",

	routes: {
		get: $get,
	},
});

export default command;
