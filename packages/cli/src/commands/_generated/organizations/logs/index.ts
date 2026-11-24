import $audit from "./audit/index.js";
/**
 * logs command group
 * @generated from apis/overlays/organizations.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "logs",
	describe: "Operations for logs",

	routes: {
		audit: $audit,
	},
});

export default command;
