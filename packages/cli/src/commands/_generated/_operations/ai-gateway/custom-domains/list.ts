/** @generated from ai-gateway.custom-domains.list */
export default {
	method: "GET",
	path: "/accounts/{account_id}/ai-gateway/gateways/{gateway_id}/custom-domains",
	query: ["page", "per_page", "status", "search"],
	errors: {
		400: "BadRequestError",
	},
} as const;
