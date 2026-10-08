/** @generated from connector-telemetry-events.get */
export default {
	method: "GET",
	path: "/accounts/{account_id}/magic/connectors/{connector_id}/telemetry/events/{event_t}.{event_n}",
	errors: {
		400: "BadRequestError",
		401: "UnauthorizedError",
		403: "ForbiddenError",
		404: "NotFoundError",
		429: "TooManyRequestsError",
		500: "InternalServerError",
	},
} as const;
