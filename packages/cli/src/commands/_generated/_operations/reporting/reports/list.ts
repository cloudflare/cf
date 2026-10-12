/** @generated from reporting-reports-list */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/reporting/reports`,
	errors: {
		400: "BadRequestError",
	},
} as const;
