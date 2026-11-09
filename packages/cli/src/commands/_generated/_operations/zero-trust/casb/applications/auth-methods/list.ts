/** @generated from zero-trust.casb.applications.auth-methods.list */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/one/applications/${request.application_id}/auth-methods`,
	query: ["environment", "page", "page_size"],
	errors: {
		400: "BadRequestError",
		404: "NotFoundError",
	},
} as const;
