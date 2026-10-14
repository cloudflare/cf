/** @generated from zero-trust.casb.integrations.get */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/one/integrations/${request.id}`,
	errors: {
		404: "NotFoundError",
	},
} as const;
