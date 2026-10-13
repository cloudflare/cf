/** @generated from ai-gateway.datasets.update */
import { path } from "#api";

export default {
	method: "PUT",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/ai-gateway/gateways/${request.gateway_id}/datasets/${request.id}`,
	body: "json",
	errors: {
		400: "BadRequestError",
		404: "NotFoundError",
	},
} as const;
