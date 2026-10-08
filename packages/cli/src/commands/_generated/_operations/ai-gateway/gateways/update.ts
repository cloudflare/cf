/** @generated from ai-gateway.gateways.update */
export default {
	method: "PUT",
	path: "/accounts/{account_id}/ai-gateway/gateways/{id}",
	body: "json",
	errors: {
		400: "BadRequestError",
		404: "NotFoundError",
	},
} as const;
