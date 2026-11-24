import $create from "./create.js";
import $delete from "./delete.js";
import $edit from "./edit.js";
import $get from "./get.js";
import $list from "./list.js";
import $previews from "./previews/index.js";
import $update from "./update.js";
/**
 * healthchecks command
 * @generated from apis/overlays/healthchecks.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "healthchecks",
	describe:
		"Standalone health checks that monitor origin server availability from Cloudflare's edge",

	routes: {
		create: $create,
		delete: $delete,
		edit: $edit,
		get: $get,
		list: $list,
		update: $update,
		previews: $previews,
	},
});

export default command;
