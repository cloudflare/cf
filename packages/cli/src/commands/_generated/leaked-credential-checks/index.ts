import $detections from "./detections/index.js";
import $get from "./get.js";
import $update from "./update.js";
/**
 * leaked-credential-checks command
 * @generated from apis/overlays/leaked-credential-checks.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "leaked-credential-checks",
	describe:
		"Detect compromised credentials in login requests by checking against known breach databases",

	routes: {
		get: $get,
		update: $update,
		detections: $detections,
	},
});

export default command;
