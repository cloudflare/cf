import $get from "./get.js";
import $network from "./network/index.js";
/**
 * recording command group
 * @generated from apis/overlays/browser-run.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "recording",
	describe: "Operations for recording",

	routes: {
		get: $get,
		network: $network,
	},
});

export default command;
