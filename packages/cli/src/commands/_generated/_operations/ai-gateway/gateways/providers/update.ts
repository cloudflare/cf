/** @generated from ai-gateway.gateways.providers.update */
export default {
	method: "PUT",
	path: "/accounts/{account_id}/ai-gateway/gateways/{gateway_id}/provider_configs/{id}",
	body: "json",
	errors: {
		400: "BadRequestError",
		404: "NotFoundError",
	},
} as const;
