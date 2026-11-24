import $responses from "./responses/index.js";
import $scans from "./scans/index.js";
/**
 * url-scanner command
 * @generated from apis/overlays/url-scanner.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "url-scanner",
	describe:
		"Scan URLs for phishing, malware, and other threats — submit scans and retrieve detailed results",

	routes: {
		responses: $responses,
		scans: $scans,
	},
});

export default command;
