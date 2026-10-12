/** @generated from delete_DomainDelete */
import { path } from "#api";

export default {
	method: "DELETE",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/cloudforce-one/v2/credential-monitor/domains/${request.id}`,
	errors: {
		404: "NotFoundError",
	},
} as const;
