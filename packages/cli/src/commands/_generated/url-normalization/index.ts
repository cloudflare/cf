import $delete from "./delete.js";
import $get from "./get.js";
import $update from "./update.js";
/**
 * url-normalization command
 * @generated from apis/overlays/url-normalization.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "url-normalization",
	describe: "url-normalization",

	routes: {
		delete: $delete,
		get: $get,
		update: $update,
	},
});

export default command;
