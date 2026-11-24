import $certificatepack from "./certificate-pack/index.js";
import $create from "./create.js";
import $delete from "./delete.js";
import $edit from "./edit.js";
import $fallbackorigin from "./fallback-origin/index.js";
import $get from "./get.js";
import $list from "./list.js";
import $quota from "./quota/index.js";
/**
 * custom-hostnames command
 * @generated from apis/overlays/custom-hostnames.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "custom-hostnames",
	describe: "custom-hostnames",

	routes: {
		create: $create,
		delete: $delete,
		edit: $edit,
		get: $get,
		list: $list,
		"certificate-pack": $certificatepack,
		"fallback-origin": $fallbackorigin,
		quota: $quota,
	},
});

export default command;
