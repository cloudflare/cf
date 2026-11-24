import $get from "./get.js";
/**
 * managed command group
 * @generated from apis/overlays/cloudforce-one.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "managed",
	describe: "Managed rule operations",

	routes: {
		get: $get,
	},
});

export default command;
