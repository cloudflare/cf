import $delete from "./delete.js";
import $get from "./get.js";
import $update from "./update.js";
/**
 * field-extractors command
 * @generated from apis/overlays/field-extractors.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "field-extractors",
	describe: "field-extractors",

	routes: {
		delete: $delete,
		get: $get,
		update: $update,
	},
});

export default command;
