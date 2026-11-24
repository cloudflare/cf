import $get from "./get.js";
/**
 * domain command group
 * @generated from apis/overlays/radar.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "domain",
	describe: "Operations for ranking.domain",

	routes: {
		get: $get,
	},
});

export default command;
