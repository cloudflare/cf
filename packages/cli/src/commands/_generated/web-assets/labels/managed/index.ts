import $get from "./get.js";
import $operations from "./operations/index.js";
/**
 * managed command group
 * @generated from apis/overlays/web-assets.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "managed",
	describe: "Operations for labels.managed",

	routes: {
		get: $get,
		operations: $operations,
	},
});

export default command;
