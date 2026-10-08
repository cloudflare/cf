/** @generated from logs.datasets.get */
export default {
	method: "GET",
	path: "/{account_or_zone}/{account_or_zone_id}/logs/explorer/datasets/{dataset_id}",
	errors: {
		400: "BadRequestError",
		403: "ForbiddenError",
		404: "NotFoundError",
	},
} as const;
