import $keys from "./keys.js";
import $query from "./query.js";
import $values from "./values.js";
/**
 * telemetry command group
 * @generated from apis/overlays/o11y.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "telemetry",
	describe: "Operations for telemetry",

	routes: {
		keys: $keys,
		query: $query,
		values: $values,
	},
});

export default command;
