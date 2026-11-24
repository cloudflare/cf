import $delete from "./delete.js";
import $edit from "./edit.js";
import $get from "./get.js";
/**
 * variants command group
 * @generated from apis/overlays/cache.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "variants",
	describe:
		"Serve different cached versions of an image based on the Accept header (WebP, AVIF, etc.)",

	routes: {
		delete: $delete,
		edit: $edit,
		get: $get,
	},
});

export default command;
