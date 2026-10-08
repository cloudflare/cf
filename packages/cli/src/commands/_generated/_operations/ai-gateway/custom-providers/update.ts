/** @generated from ai-gateway.custom-providers.update */
export default {
	method: "PATCH",
	path: "/accounts/{account_id}/ai-gateway/custom-providers/{id}",
	body: "json",
	errors: {
		400: "BadRequestError",
		404: "NotFoundError",
	},
} as const;
