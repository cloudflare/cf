import $get from "./get.js";
/**
 * files command group
 * @generated from apis/overlays/artifacts.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "files",
	describe: "Operations for namespaces.repos.files",

	routes: {
		get: $get,
	},
});

export default command;
