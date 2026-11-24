import $get from "./get.js";
import $update from "./update.js";
/**
 * logging command group
 * @generated from apis/overlays/zero-trust.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "logging",
	describe: "Operations for gateway.logging",

	routes: {
		get: $get,
		update: $update,
	},
});

export default command;
