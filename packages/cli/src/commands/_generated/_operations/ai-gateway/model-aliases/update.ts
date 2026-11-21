/** @generated from ai-gateway.model-aliases.update */
import { path } from "#api";

export default {
	method: "PUT",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/ai-gateway/gateways/${request.gateway_id}/model_aliases/${request.id}`,
	body: "json",
	errors: {
		400: "BadRequestError",
	},
} as const;
