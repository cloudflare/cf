import $feedback from "./feedback/index.js";
import $get from "./get.js";
import $update from "./update.js";
/**
 * bot-management command
 * @generated from apis/overlays/bot-management.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "bot-management",
	describe: "bot-management",

	routes: {
		get: $get,
		update: $update,
		feedback: $feedback,
	},
});

export default command;
