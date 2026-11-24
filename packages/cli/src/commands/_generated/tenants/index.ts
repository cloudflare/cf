import $accounts from "./accounts/index.js";
/**
 * tenants command
 * @generated from apis/overlays/tenants.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "tenants",
	describe: "Multi-tenant account management",

	routes: {
		accounts: $accounts,
	},
});

export default command;
