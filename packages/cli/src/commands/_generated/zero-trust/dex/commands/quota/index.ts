import $get from "./get.js";
/**
 * quota command group
 * @generated from apis/overlays/zero-trust.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "quota",
	describe: "Operations for dex.commands.quota",

	routes: {
		get: $get,
	},
});

export default command;
