import $countzonesenabledforaccount from "./count-zones-enabled-for-account.js";
import $countzonesenabledforuser from "./count-zones-enabled-for-user.js";
import $edit from "./edit.js";
import $get from "./get.js";
/**
 * smart-routing command group
 * @generated from apis/overlays/argo.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "smart-routing",
	describe:
		"Route traffic through the fastest network paths to your origin using real-time latency data",

	routes: {
		"count-zones-enabled-for-account": $countzonesenabledforaccount,
		"count-zones-enabled-for-user": $countzonesenabledforuser,
		edit: $edit,
		get: $get,
	},
});

export default command;
