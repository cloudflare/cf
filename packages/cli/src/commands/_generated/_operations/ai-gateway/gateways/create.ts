/** @generated from ai-gateway.gateways.create */
import { path } from "#api";

export default {
	method: "POST",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/ai-gateway/gateways`,
	body: "json",
	errors: {
		400: "BadRequestError",
	},
} as const;
