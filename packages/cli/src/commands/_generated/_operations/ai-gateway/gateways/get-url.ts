/** @generated from ai-gateway.gateways.get-url */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/ai-gateway/gateways/${request.gateway_id}/url/${request.provider}`,
	errors: {
		400: "BadRequestError",
	},
} as const;
