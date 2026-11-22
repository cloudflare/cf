/** @generated from ai-gateway.model-aliases.delete */
import { path } from "#api";

export default {
	method: "DELETE",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/ai-gateway/gateways/${request.gateway_id}/model_aliases/${request.id}`,
	errors: {
		400: "BadRequestError",
	},
} as const;
