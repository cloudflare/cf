import $databases from "./databases.js";
import $queries from "./queries.js";
/**
 * insights command group
 * @generated from apis/overlays/d1.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "insights",
	describe: "show usage insights for the D1 databases in your account",

	routes: {
		databases: $databases,
		queries: $queries,
	},
});

export default command;
