import $create from "./create.js";
import $delete from "./delete.js";
import $get from "./get.js";
import $list from "./list.js";
import $update from "./update.js";
import $upload from "./upload.js";
/**
 * document-fingerprints command group
 * @generated from apis/overlays/zero-trust.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "document-fingerprints",
	describe:
		"Data Loss Prevention - manage document fingerprints for detecting matching documents",

	routes: {
		create: $create,
		delete: $delete,
		get: $get,
		list: $list,
		update: $update,
		upload: $upload,
	},
});

export default command;
