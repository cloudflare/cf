import $aggregates from "./aggregates/index.js";
import $events from "./events/index.js";
import $zones from "./zones/index.js";
/**
 * analytics command group
 * @generated from apis/overlays/spectrum.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "analytics",
	describe:
		"Real-time and historical connection analytics for Spectrum applications",

	routes: {
		aggregates: $aggregates,
		events: $events,
		zones: $zones,
	},
});

export default command;
