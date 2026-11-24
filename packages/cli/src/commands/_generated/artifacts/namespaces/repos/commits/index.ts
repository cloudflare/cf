import $get from "./get.js";
/**
 * commits command group
 * @generated from apis/overlays/artifacts.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "commits",
	describe: "Operations for namespaces.repos.commits",

	routes: {
		get: $get,
	},
});

export default command;
