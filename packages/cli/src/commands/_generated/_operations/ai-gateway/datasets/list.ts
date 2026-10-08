/** @generated from ai-gateway.datasets.list */
export default {
	method: "GET",
	path: "/accounts/{account_id}/ai-gateway/gateways/{gateway_id}/datasets",
	query: ["page", "per_page", "name", "enable", "search"],
	errors: {
		400: "BadRequestError",
	},
} as const;
