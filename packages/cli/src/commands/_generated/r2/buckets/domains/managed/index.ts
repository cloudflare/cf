import $get from "./get.js";
import $update from "./update.js";
/**
 * managed command group
 * @generated from apis/overlays/r2.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "managed",
	describe: "Operations for buckets.domains.managed",

	routes: {
		get: $get,
		update: $update,
	},
});

export default command;
