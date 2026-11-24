import $create from "./create.js";
import $delete from "./delete.js";
import $get from "./get.js";
import $list from "./list.js";
import $lookup from "./lookup.js";
import $references from "./references.js";
import $update from "./update.js";
/**
 * applications command group
 * @generated from apis/overlays/accounts.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "applications",
	describe:
		"List Cloudflare-curated and custom applications, and manage custom applications",

	routes: {
		create: $create,
		delete: $delete,
		get: $get,
		list: $list,
		lookup: $lookup,
		references: $references,
		update: $update,
	},
});

export default command;
