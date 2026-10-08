/** @generated from ai-gateway.gateways.list */
export default {
	method: "GET",
	path: "/accounts/{account_id}/ai-gateway/gateways",
	query: ["page", "per_page", "search"],
	errors: {
		400: "BadRequestError",
	},
} as const;
