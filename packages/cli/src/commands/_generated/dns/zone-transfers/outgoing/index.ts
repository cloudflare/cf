import $create from "./create.js";
import $delete from "./delete.js";
import $disable from "./disable.js";
import $enable from "./enable.js";
import $forcenotify from "./force-notify.js";
import $get from "./get.js";
import $status from "./status.js";
import $update from "./update.js";
/**
 * outgoing command group
 * @generated from apis/overlays/dns.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "outgoing",
	describe: "Operations for zone-transfers.outgoing",

	routes: {
		create: $create,
		delete: $delete,
		disable: $disable,
		enable: $enable,
		"force-notify": $forcenotify,
		get: $get,
		status: $status,
		update: $update,
	},
});

export default command;
