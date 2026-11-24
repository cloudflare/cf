import $browser from "./browser/index.js";
import $json from "./json/index.js";
import $session from "./session/index.js";
/**
 * devtools command group
 * @generated from apis/overlays/browser-run.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "devtools",
	describe: "Operations for devtools",

	routes: {
		browser: $browser,
		json: $json,
		session: $session,
	},
});

export default command;
