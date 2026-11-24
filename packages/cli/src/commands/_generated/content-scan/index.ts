import $expressions from "./expressions/index.js";
import $get from "./get.js";
import $update from "./update.js";
/**
 * content-scan command
 * @generated from apis/overlays/content-scan.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "content-scan",
	describe:
		"Malicious uploads detection, scan uploaded content in HTTP requests for malware and malicious payloads",

	routes: {
		get: $get,
		update: $update,
		expressions: $expressions,
	},
});

export default command;
