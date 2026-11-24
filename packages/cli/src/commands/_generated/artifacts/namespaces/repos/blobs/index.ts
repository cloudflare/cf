import $get from "./get.js";
/**
 * blobs command group
 * @generated from apis/overlays/artifacts.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "blobs",
	describe: "Operations for namespaces.repos.blobs",

	routes: {
		get: $get,
	},
});

export default command;
