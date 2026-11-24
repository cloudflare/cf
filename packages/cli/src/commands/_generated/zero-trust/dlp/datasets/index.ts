import $create from "./create.js";
import $delete from "./delete.js";
import $get from "./get.js";
import $list from "./list.js";
import $prepareupload from "./prepare-upload.js";
import $update from "./update.js";
import $upload from "./upload.js";
/**
 * datasets command group
 * @generated from apis/overlays/zero-trust.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "datasets",
	describe: "Data Loss Prevention - manage datasets, versions, and uploads",

	routes: {
		create: $create,
		delete: $delete,
		get: $get,
		list: $list,
		"prepare-upload": $prepareupload,
		update: $update,
		upload: $upload,
	},
});

export default command;
