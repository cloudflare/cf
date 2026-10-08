/** @generated from ai-gateway.datasets.update */
export default {
	method: "PUT",
	path: "/accounts/{account_id}/ai-gateway/gateways/{gateway_id}/datasets/{id}",
	body: "json",
	errors: {
		400: "BadRequestError",
		404: "NotFoundError",
	},
} as const;
