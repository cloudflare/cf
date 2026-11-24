import $datasets from "./datasets/index.js";
import $events from "./events/index.js";
import $indicators from "./indicators/index.js";
import $search from "./search.js";
import $tags from "./tags/index.js";
/**
 * threat-intel command group
 * @generated from apis/overlays/cloudforce-one.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "threat-intel",
	describe: "Operations for threat-intel",

	routes: {
		search: $search,
		datasets: $datasets,
		events: $events,
		indicators: $indicators,
		tags: $tags,
	},
});

export default command;
