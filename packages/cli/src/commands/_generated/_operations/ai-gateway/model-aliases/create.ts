/** @generated from ai-gateway.model-aliases.create */
import { path } from "#api";

export default {
	method: "POST",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/ai-gateway/gateways/${request.gateway_id}/model_aliases`,
	body: "json",
	errors: {
		400: "BadRequestError",
	},
} as const;
