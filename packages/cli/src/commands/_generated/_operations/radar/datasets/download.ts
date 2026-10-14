/** @generated from radar.datasets.download */
export default {
	method: "POST",
	path: () => "/radar/datasets/download",
	query: ["format"],
	body: "json",
	errors: {
		400: "BadRequestError",
	},
} as const;
