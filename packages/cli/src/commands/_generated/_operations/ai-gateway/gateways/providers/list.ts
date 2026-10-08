/** @generated from ai-gateway.gateways.providers.list */
export default {
	method: "GET",
	path: "/accounts/{account_id}/ai-gateway/gateways/{gateway_id}/provider_configs",
	query: ["page", "per_page"],
	errors: {
		400: "BadRequestError",
	},
} as const;
