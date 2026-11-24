import $edit from "./edit.js";
import $get from "./get.js";
/**
 * binary-ast command group
 * @generated from apis/overlays/zones.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "binary-ast",
	describe: "Operations for binary-ast",

	routes: {
		edit: $edit,
		get: $get,
	},
});

export default command;
