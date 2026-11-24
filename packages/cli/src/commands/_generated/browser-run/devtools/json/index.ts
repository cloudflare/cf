import $get from "./get.js";
/**
 * json command group
 * @generated from apis/overlays/browser-run.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "json",
	describe: "Operations for devtools.json",

	routes: {
		get: $get,
	},
});

export default command;
