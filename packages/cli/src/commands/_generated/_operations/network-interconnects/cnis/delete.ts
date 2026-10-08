/** @generated from network-interconnects.cnis.delete */
export default {
	method: "DELETE",
	path: "/accounts/{account_id}/cni/cnis/{cni}",
	response: false,
	errors: {
		400: "BadRequestError",
		404: "NotFoundError",
		500: "InternalServerError",
	},
} as const;
