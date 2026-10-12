/** @generated from ai-gateway.custom-providers.get */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/ai-gateway/custom-providers/${request.id}`,
	errors: {
		404: "NotFoundError",
	},
} as const;
