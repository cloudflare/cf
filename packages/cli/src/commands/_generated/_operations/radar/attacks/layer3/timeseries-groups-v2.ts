/** @generated from radar.attacks.layer3.timeseries-groups-v2 */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/radar/attacks/layer3/timeseries_groups/${request.dimension}`,
	query: [
		"aggInterval",
		"name",
		"dateRange",
		"dateStart",
		"dateEnd",
		"location",
		"continent",
		"ipVersion",
		"protocol",
		"normalization",
		"direction",
		"limitPerGroup",
		"format",
	],
	errors: {
		400: "BadRequestError",
	},
} as const;
