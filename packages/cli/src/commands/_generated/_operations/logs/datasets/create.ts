/** @generated from logs.datasets.create */
export default {
	method: "POST",
	path: "/{account_or_zone}/{account_or_zone_id}/logs/explorer/datasets",
	body: "json",
	errors: {
		400: "BadRequestError",
		403: "ForbiddenError",
		404: "NotFoundError",
		409: "ConflictError",
	},
} as const;
