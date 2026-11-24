import $discovery from "./discovery/index.js";
import $labels from "./labels/index.js";
import $operations from "./operations/index.js";
import $schemas from "./schemas/index.js";
/**
 * web-assets command
 * @generated from apis/overlays/web-assets.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "web-assets",
	describe: "web-assets",

	routes: {
		discovery: $discovery,
		labels: $labels,
		operations: $operations,
		schemas: $schemas,
	},
});

export default command;
