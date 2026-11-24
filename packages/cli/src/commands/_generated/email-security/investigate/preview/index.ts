import $generate from "./generate.js";
import $get from "./get.js";
/**
 * preview command group
 * @generated from apis/overlays/email-security.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "preview",
	describe: "Operations for investigate.preview",

	routes: {
		generate: $generate,
		get: $get,
	},
});

export default command;
