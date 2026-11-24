import $query from "./query.js";
/**
 * sql command group
 * @generated from apis/overlays/analytics-engine.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "sql",
	describe: "Operations for sql",

	routes: {
		query: $query,
	},
});

export default command;
