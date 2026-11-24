import $get from "./get.js";
import $update from "./update.js";
/**
 * precursor command
 * @generated from apis/overlays/precursor.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "precursor",
	describe: "Precursor settings for a zone",

	routes: {
		get: $get,
		update: $update,
	},
});

export default command;
