/** @generated from ai-gateway.dynamic-routing.list */
export default {
	method: "GET",
	path: "/accounts/{account_id}/ai-gateway/gateways/{gateway_id}/routes",
	query: ["page", "per_page"],
	errors: {
		400: "BadRequestError",
	},
} as const;
