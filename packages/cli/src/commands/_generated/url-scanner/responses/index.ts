import $get from "./get.js";
/**
 * responses command group
 * @generated from apis/overlays/url-scanner.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "responses",
	describe: "Raw HTTP response data captured during URL scans",

	routes: {
		get: $get,
	},
});

export default command;
