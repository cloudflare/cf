/** @generated from radar.attacks.layer3.timeseries-groups-v2 */
export default {
	method: "GET",
	path: "/radar/attacks/layer3/timeseries_groups/{dimension}",
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
