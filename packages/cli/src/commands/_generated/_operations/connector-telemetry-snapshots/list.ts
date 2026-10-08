/** @generated from connector-telemetry-snapshots.list */
export default {
	method: "GET",
	path: "/accounts/{account_id}/magic/connectors/{connector_id}/telemetry/snapshots",
	query: ["from", "to", "limit", "cursor"],
	errors: {
		400: "BadRequestError",
		401: "UnauthorizedError",
		403: "ForbiddenError",
		429: "TooManyRequestsError",
		500: "InternalServerError",
	},
} as const;
