/** @generated from radar.datasets.list */
export default {
	method: "GET",
	path: () => "/radar/datasets",
	query: ["limit", "offset", "datasetType", "date", "format"],
	errors: {
		400: "BadRequestError",
	},
} as const;
