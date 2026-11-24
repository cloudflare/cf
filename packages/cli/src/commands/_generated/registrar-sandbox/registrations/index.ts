import $check from "./check.js";
import $create from "./create.js";
import $getregistrationstatus from "./get-registration-status.js";
import $getupdatestatus from "./get-update-status.js";
import $get from "./get.js";
import $list from "./list.js";
import $search from "./search.js";
import $update from "./update.js";
/**
 * registrations command group
 * @generated from apis/overlays/registrar-sandbox.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "registrations",
	describe: "Operations for registrations",

	routes: {
		check: $check,
		create: $create,
		get: $get,
		"get-registration-status": $getregistrationstatus,
		"get-update-status": $getupdatestatus,
		list: $list,
		search: $search,
		update: $update,
	},
});

export default command;
