/** @generated from reporting.policies.list */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/reporting/policies`,
	errors: {
		400: "BadRequestError",
	},
} as const;
