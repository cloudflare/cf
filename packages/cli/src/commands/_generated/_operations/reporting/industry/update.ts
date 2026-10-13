/** @generated from reporting.industry.update */
import { path } from "#api";

export default {
	method: "PATCH",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/reporting/industry`,
	body: "json",
	errors: {
		400: "BadRequestError",
		423: "LockedError",
		500: "InternalServerError",
	},
} as const;
