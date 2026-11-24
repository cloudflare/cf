import $get from "./get.js";
/**
 * config-autofill command group
 * @generated from apis/overlays/builds.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "config-autofill",
	describe: "Operations for repos.config-autofill",

	routes: {
		get: $get,
	},
});

export default command;
