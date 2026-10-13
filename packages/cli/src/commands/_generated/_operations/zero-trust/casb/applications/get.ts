/** @generated from zero-trust.casb.applications.get */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/one/applications/${request.application_id}`,
	errors: {
		404: "NotFoundError",
	},
} as const;
