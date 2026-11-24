import $edit from "./edit.js";
import $get from "./get.js";
/**
 * csam-scanner command
 * @generated from apis/overlays/csam-scanner.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "csam-scanner",
	describe: "csam-scanner",

	routes: {
		edit: $edit,
		get: $get,
	},
});

export default command;
