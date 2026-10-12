/** @generated from ai-gateway.datasets.delete */
import { path } from "#api";

export default {
	method: "DELETE",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/ai-gateway/gateways/${request.gateway_id}/datasets/${request.id}`,
	errors: {
		404: "NotFoundError",
	},
} as const;
