/** @generated from logs.datasets.list */
export default {
	method: "GET",
	path: "/{account_or_zone}/{account_or_zone_id}/logs/explorer/datasets",
	query: ["include_zones"],
	errors: {
		400: "BadRequestError",
		403: "ForbiddenError",
		404: "NotFoundError",
	},
} as const;
