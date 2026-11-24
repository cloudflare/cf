import $config from "./config/index.js";
import $create from "./create.js";
import $delete from "./delete.js";
import $directupload from "./direct-upload.js";
import $edit from "./edit.js";
import $flows from "./flows/index.js";
import $getblob from "./get-blob.js";
import $get from "./get.js";
import $import from "./import/index.js";
import $keys from "./keys/index.js";
import $list from "./list.js";
import $stats from "./stats.js";
import $variants from "./variants/index.js";
/**
 * images command
 * @generated from apis/overlays/images.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "images",
	describe:
		"Store, resize, and deliver optimized images globally - variants, signing keys, and direct uploads",

	routes: {
		create: $create,
		delete: $delete,
		"direct-upload": $directupload,
		edit: $edit,
		get: $get,
		"get-blob": $getblob,
		list: $list,
		stats: $stats,
		config: $config,
		flows: $flows,
		import: $import,
		keys: $keys,
		variants: $variants,
	},
});

export default command;
