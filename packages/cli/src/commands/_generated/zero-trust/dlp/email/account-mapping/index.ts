import $create from "./create.js";
import $get from "./get.js";
/**
 * account-mapping command group
 * @generated from apis/overlays/zero-trust.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "account-mapping",
	describe:
		"Data Loss Prevention - configure account mappings for outbound email scanning",

	routes: {
		create: $create,
		get: $get,
	},
});

export default command;
