/** @generated from logs.query */
export default {
	method: "POST",
	path: "/{account_or_zone}/{account_or_zone_id}/logs/explorer/query/sql",
	errors: {
		400: "BadRequestError",
		403: "ForbiddenError",
		404: "NotFoundError",
		507: "InsufficientStorageError",
	},
} as const;
