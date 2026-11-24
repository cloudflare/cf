import $get from "./get.js";
/**
 * usage-limit command group
 * @generated from apis/overlays/observability.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "usage-limit",
	describe: "Operations for usage-limit",

	routes: {
		get: $get,
	},
});

export default command;
