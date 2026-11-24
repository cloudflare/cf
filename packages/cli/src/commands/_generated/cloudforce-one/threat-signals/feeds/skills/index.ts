import $get from "./get.js";
import $update from "./update.js";
/**
 * skills command group
 * @generated from apis/overlays/cloudforce-one.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "skills",
	describe: "Operations for threat-signals.feeds.skills",

	routes: {
		get: $get,
		update: $update,
	},
});

export default command;
