/** @generated from radar-post-reports-dataset-download-url */
export default {
	method: "POST",
	path: () => "/radar/datasets/download",
	query: ["format"],
	body: "json",
	errors: {
		400: "BadRequestError",
	},
} as const;
