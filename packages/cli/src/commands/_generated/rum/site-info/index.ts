import $create from "./create.js";
import $delete from "./delete.js";
import $get from "./get.js";
import $listsitetags from "./list-site-tags.js";
import $listzonetags from "./list-zone-tags.js";
import $list from "./list.js";
import $update from "./update.js";
import $validatehostname from "./validate-hostname.js";
/**
 * site-info command group
 * @generated from apis/overlays/rum.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "site-info",
	describe:
		"Web Analytics sites — register domains and get the JavaScript beacon snippet",

	routes: {
		create: $create,
		delete: $delete,
		get: $get,
		list: $list,
		"list-site-tags": $listsitetags,
		"list-zone-tags": $listzonetags,
		update: $update,
		"validate-hostname": $validatehostname,
	},
});

export default command;
