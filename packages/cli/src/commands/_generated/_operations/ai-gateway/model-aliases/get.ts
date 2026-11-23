/** @generated from ai-gateway.model-aliases.get */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/ai-gateway/gateways/${request.gateway_id}/model_aliases/${request.id}`,
	errors: {
		400: "BadRequestError",
	},
} as const;
