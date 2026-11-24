import $usage from "./usage/index.js";
/**
 * billing command group
 * @generated from apis/overlays/organizations.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "billing",
	describe: "Operations for billing",

	routes: {
		usage: $usage,
	},
});

export default command;
