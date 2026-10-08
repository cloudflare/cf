/** @generated from network-interconnects.cnis.update */
export default {
	method: "PUT",
	path: "/accounts/{account_id}/cni/cnis/{cni}",
	body: "json",
	errors: {
		400: "BadRequestError",
		404: "NotFoundError",
		500: "InternalServerError",
	},
} as const;
