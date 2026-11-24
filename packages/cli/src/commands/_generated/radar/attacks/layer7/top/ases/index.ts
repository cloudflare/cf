import $origin from "./origin.js";
/**
 * ases command group
 * @generated from apis/overlays/radar.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "ases",
	describe: "Operations for attacks.layer7.top.ases",

	routes: {
		origin: $origin,
	},
});

export default command;
