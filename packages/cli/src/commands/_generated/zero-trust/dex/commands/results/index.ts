import $get from "./get.js";
/**
 * results command group
 * @generated from apis/overlays/zero-trust.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "results",
	describe: "Operations for dex.commands.results",

	routes: {
		get: $get,
	},
});

export default command;
