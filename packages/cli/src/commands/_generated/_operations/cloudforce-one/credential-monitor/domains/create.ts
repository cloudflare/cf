/** @generated from post_DomainCreate */
import { path } from "#api";

export default {
	method: "POST",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/cloudforce-one/v2/credential-monitor/domains`,
	body: "json",
	errors: {
		400: "BadRequestError",
		409: "ConflictError",
	},
} as const;
