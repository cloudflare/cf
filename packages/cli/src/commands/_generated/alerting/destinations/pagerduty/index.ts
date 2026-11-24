import $create from "./create.js";
import $delete from "./delete.js";
import $get from "./get.js";
import $link from "./link.js";
/**
 * pagerduty command group
 * @generated from apis/overlays/alerting.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "pagerduty",
	describe: "Operations for destinations.pagerduty",

	routes: {
		create: $create,
		delete: $delete,
		get: $get,
		link: $link,
	},
});

export default command;
