import $status from "./status/index.js";
/**
 * protection command group
 * @generated from apis/overlays/magic-transit.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "protection",
	describe: "Operations for advanced-tcp-protection.configs.tcp.protection",

	routes: {
		status: $status,
	},
});

export default command;
