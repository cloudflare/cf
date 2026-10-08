/** @generated from ai-gateway.evaluations.list */
export default {
	method: "GET",
	path: "/accounts/{account_id}/ai-gateway/gateways/{gateway_id}/evaluations",
	query: ["page", "per_page", "name", "processed", "search"],
	errors: {
		400: "BadRequestError",
	},
} as const;
