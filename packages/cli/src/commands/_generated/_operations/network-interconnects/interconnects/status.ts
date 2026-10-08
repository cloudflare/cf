/** @generated from network-interconnects.interconnects.status */
export default {
	method: "GET",
	path: "/accounts/{account_id}/cni/interconnects/{icon}/status",
	errors: {
		400: "BadRequestError",
		404: "NotFoundError",
		500: "InternalServerError",
	},
} as const;
