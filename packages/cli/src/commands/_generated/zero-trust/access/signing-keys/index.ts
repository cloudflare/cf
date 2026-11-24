import $get from "./get.js";
import $rotate from "./rotate.js";
import $update from "./update.js";
/**
 * signing-keys command group
 * @generated from apis/overlays/zero-trust.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "signing-keys",
	describe: "Operations for access.signing-keys",

	routes: {
		get: $get,
		rotate: $rotate,
		update: $update,
	},
});

export default command;
