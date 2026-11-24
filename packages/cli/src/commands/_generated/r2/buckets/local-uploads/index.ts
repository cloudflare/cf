import $get from "./get.js";
import $update from "./update.js";
/**
 * local-uploads command group
 * @generated from apis/overlays/r2.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "local-uploads",
	describe: "R2 bucket local upload configuration",

	routes: {
		get: $get,
		update: $update,
	},
});

export default command;
