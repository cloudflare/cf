import $create from "./create.js";
import $delete from "./delete.js";
import $edit from "./edit.js";
import $get from "./get.js";
import $migratetopreviews from "./migrate-to-previews.js";
import $purgecache from "./purge-cache.js";
/**
 * workers command group
 * @generated from apis/overlays/builds.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "workers",
	describe: "Manage repository-backed build configuration for Workers.",

	routes: {
		create: $create,
		delete: $delete,
		edit: $edit,
		get: $get,
		"migrate-to-previews": $migratetopreviews,
		"purge-cache": $purgecache,
	},
});

export default command;
