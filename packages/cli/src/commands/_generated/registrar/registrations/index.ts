import $check from "./check.js";
import $getregistrationstatus from "./get-registration-status.js";
import $gettransferstatus from "./get-transfer-status.js";
import $getupdatestatus from "./get-update-status.js";
import $get from "./get.js";
import $list from "./list.js";
import $search from "./search.js";
import $transfercheck from "./transfer-check.js";
import $transferin from "./transfer-in.js";
import $update from "./update.js";
import $create from "#commands/registrar/registrations/create/index.js";
/**
 * registrations command group
 * @generated from apis/overlays/registrar.ts
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
		"get-transfer-status": $gettransferstatus,
		"get-update-status": $getupdatestatus,
		list: $list,
		search: $search,
		"transfer-check": $transfercheck,
		"transfer-in": $transferin,
		update: $update,
	},
});

export default command;
