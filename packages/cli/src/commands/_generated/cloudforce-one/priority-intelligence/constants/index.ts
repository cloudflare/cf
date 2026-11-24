import $get from "./get.js";
/**
 * constants command group
 * @generated from apis/overlays/cloudforce-one.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "constants",
	describe: "Operations for priority-intelligence.constants",

	routes: {
		get: $get,
	},
});

export default command;
