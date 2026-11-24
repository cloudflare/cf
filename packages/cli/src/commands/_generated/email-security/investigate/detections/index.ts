import $get from "./get.js";
/**
 * detections command group
 * @generated from apis/overlays/email-security.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "detections",
	describe: "Operations for investigate.detections",

	routes: {
		get: $get,
	},
});

export default command;
