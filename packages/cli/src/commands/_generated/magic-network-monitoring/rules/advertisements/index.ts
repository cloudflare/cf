import $edit from "./edit.js";
/**
 * advertisements command group
 * @generated from apis/overlays/magic-network-monitoring.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "advertisements",
	describe: "Operations for rules.advertisements",

	routes: {
		edit: $edit,
	},
});

export default command;
