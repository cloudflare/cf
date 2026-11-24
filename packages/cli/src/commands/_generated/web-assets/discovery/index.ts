import $get from "./get.js";
import $operations from "./operations/index.js";
/**
 * discovery command group
 * @generated from apis/overlays/web-assets.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "discovery",
	describe: "Operations for discovery",

	routes: {
		get: $get,
		operations: $operations,
	},
});

export default command;
