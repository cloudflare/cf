import $get from "./get.js";
/**
 * trees command group
 * @generated from apis/overlays/artifacts.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "trees",
	describe: "Operations for namespaces.repos.trees",

	routes: {
		get: $get,
	},
});

export default command;
