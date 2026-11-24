import $datasets from "./datasets.js";
import $query from "./query.js";
/**
 * sql command
 * @generated from apis/overlays/sql.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "sql",
	describe: "sql",

	routes: {
		datasets: $datasets,
		query: $query,
	},
});

export default command;
