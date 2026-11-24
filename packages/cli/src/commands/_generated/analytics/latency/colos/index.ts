import $get from "./get.js";
/**
 * colos command group
 * @generated from apis/overlays/analytics.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "colos",
	describe: "Operations for latency.colos",

	routes: {
		get: $get,
	},
});

export default command;
