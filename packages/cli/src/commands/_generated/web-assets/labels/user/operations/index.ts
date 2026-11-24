import $update from "./update.js";
/**
 * operations command group
 * @generated from apis/overlays/web-assets.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "operations",
	describe: "Operations for labels.user.operations",

	routes: {
		update: $update,
	},
});

export default command;
