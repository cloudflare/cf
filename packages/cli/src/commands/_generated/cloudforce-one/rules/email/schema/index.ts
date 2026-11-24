import $get from "./get.js";
/**
 * schema command group
 * @generated from apis/overlays/cloudforce-one.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "schema",
	describe: "Operations for rules.email.schema",

	routes: {
		get: $get,
	},
});

export default command;
