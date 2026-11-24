import $get from "./get.js";
/**
 * unique-devices command group
 * @generated from apis/overlays/zero-trust.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "unique-devices",
	describe: "Operations for dex.overview.tests.unique-devices",

	routes: {
		get: $get,
	},
});

export default command;
