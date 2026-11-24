import $get from "./get.js";
import $update from "./update.js";
/**
 * tag-categories command group
 * @generated from apis/overlays/cloudforce-one.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "tag-categories",
	describe: "Operations for threat-signals.skills.tag-categories",

	routes: {
		get: $get,
		update: $update,
	},
});

export default command;
