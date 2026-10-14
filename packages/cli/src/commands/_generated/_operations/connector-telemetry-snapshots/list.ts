/** @generated from connector-telemetry-snapshots.list */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/magic/connectors/${request.connector_id}/telemetry/snapshots`,
	query: ["from", "to", "limit", "cursor"],
	errors: {
		400: "BadRequestError",
		401: "UnauthorizedError",
		403: "ForbiddenError",
		429: "TooManyRequestsError",
		500: "InternalServerError",
	},
} as const;
