import $get from "./get.js";
/**
 * network command group
 * @generated from apis/overlays/browser-run.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "network",
	describe: "Operations for recording.network",

	routes: {
		get: $get,
	},
});

export default command;
