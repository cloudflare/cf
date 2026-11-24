import $edit from "./edit.js";
import $get from "./get.js";
/**
 * image-resizing command group
 * @generated from apis/overlays/zones.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "image-resizing",
	describe: "Operations for image-resizing",

	routes: {
		edit: $edit,
		get: $get,
	},
});

export default command;
