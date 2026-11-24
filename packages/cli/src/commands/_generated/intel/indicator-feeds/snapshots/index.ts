import $update from "./update.js";
/**
 * snapshots command group
 * @generated from apis/overlays/intel.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "snapshots",
	describe: "Operations for indicator-feeds.snapshots",

	routes: {
		update: $update,
	},
});

export default command;
