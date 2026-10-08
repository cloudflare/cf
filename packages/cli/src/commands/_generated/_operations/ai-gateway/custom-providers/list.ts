/** @generated from ai-gateway.custom-providers.list */
export default {
	method: "GET",
	path: "/accounts/{account_id}/ai-gateway/custom-providers",
	query: ["page", "per_page", "beta", "enable", "search"],
	errors: {
		400: "BadRequestError",
	},
} as const;
