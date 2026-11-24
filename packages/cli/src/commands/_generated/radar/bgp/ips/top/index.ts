import $ases from "./ases.js";
/**
 * top command group
 * @generated from apis/overlays/radar.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "top",
	describe: "Operations for bgp.ips.top",

	routes: {
		ases: $ases,
	},
});

export default command;
