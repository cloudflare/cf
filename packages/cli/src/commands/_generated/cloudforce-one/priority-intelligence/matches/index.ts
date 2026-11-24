import $aggregateall from "./aggregate-all.js";
import $aggregate from "./aggregate.js";
import $list from "./list.js";
import $series from "./series.js";
import $update from "./update.js";
/**
 * matches command group
 * @generated from apis/overlays/cloudforce-one.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "matches",
	describe: "Operations for priority-intelligence.matches",

	routes: {
		aggregate: $aggregate,
		"aggregate-all": $aggregateall,
		list: $list,
		series: $series,
		update: $update,
	},
});

export default command;
