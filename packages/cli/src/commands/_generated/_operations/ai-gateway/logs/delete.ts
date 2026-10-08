/** @generated from ai-gateway.logs.delete */
export default {
	method: "DELETE",
	path: "/accounts/{account_id}/ai-gateway/gateways/{gateway_id}/logs",
	query: ["order_by", "order_by_direction", "filters", "limit"],
	errors: {
		400: "BadRequestError",
	},
} as const;
