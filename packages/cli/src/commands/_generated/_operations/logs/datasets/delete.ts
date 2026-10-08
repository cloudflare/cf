/** @generated from logs.datasets.delete */
export default {
	method: "DELETE",
	path: "/{account_or_zone}/{account_or_zone_id}/logs/explorer/datasets/{dataset_id}",
	errors: {
		400: "BadRequestError",
		403: "ForbiddenError",
		404: "NotFoundError",
		409: "ConflictError",
	},
} as const;
