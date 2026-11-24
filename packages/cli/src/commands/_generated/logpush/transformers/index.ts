import $content from "./content/index.js";
import $create from "./create.js";
import $delete from "./delete.js";
import $get from "./get.js";
import $list from "./list.js";
import $preview from "./preview.js";
import $update from "./update.js";
import $versions from "./versions/index.js";
/**
 * transformers command group
 * @generated from apis/overlays/logpush.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "transformers",
	describe: "Operations for transformers",

	routes: {
		create: $create,
		delete: $delete,
		get: $get,
		list: $list,
		preview: $preview,
		update: $update,
		content: $content,
		versions: $versions,
	},
});

export default command;
