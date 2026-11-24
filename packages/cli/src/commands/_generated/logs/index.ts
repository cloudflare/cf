import $datasets from "./datasets/index.js";
import $list from "./list/index.js";
import $query from "./query.js";
import $rayid from "./rayid/index.js";
import $received from "./received/index.js";
import $retrieve from "./retrieve/index.js";
/**
 * logs command
 * @generated from apis/overlays/logs.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "logs",
	describe:
		"Log control, retention, and raw log access — CMB config, ray ID lookups, and received fields",

	routes: {
		query: $query,
		datasets: $datasets,
		list: $list,
		rayid: $rayid,
		received: $received,
		retrieve: $retrieve,
	},
});

export default command;
