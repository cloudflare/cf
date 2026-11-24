import $get from "./get.js";
import $update from "./update.js";
/**
 * flows command group
 * @generated from apis/overlays/images.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "flows",
	describe:
		"Zone-level transformation flows that control how images are resized and optimized on delivery",

	routes: {
		get: $get,
		update: $update,
	},
});

export default command;
