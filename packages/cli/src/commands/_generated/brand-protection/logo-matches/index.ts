import $get from "./get.js";
/**
 * logo-matches command group
 * @generated from apis/overlays/brand-protection.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "logo-matches",
	describe: "Operations for logo-matches",

	routes: {
		get: $get,
	},
});

export default command;
