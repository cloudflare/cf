/** @generated from ai-gateway.datasets.get */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/ai-gateway/gateways/${request.gateway_id}/datasets/${request.id}`,
	errors: {
		404: "NotFoundError",
	},
} as const;
