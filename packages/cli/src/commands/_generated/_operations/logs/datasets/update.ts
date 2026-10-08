/** @generated from logs.datasets.update */
export default {
	method: "PUT",
	path: "/{account_or_zone}/{account_or_zone_id}/logs/explorer/datasets/{dataset_id}",
	body: "json",
	errors: {
		400: "BadRequestError",
		403: "ForbiddenError",
		404: "NotFoundError",
	},
} as const;
