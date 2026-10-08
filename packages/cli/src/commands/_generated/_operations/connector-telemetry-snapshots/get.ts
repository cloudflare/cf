/** @generated from connector-telemetry-snapshots.get */
export default {
	method: "GET",
	path: "/accounts/{account_id}/magic/connectors/{connector_id}/telemetry/snapshots/{snapshot_t}",
	errors: {
		400: "BadRequestError",
		401: "UnauthorizedError",
		403: "ForbiddenError",
		404: "NotFoundError",
		429: "TooManyRequestsError",
		500: "InternalServerError",
	},
} as const;
