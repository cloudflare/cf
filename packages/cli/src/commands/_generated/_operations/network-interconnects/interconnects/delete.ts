/** @generated from network-interconnects.interconnects.delete */
export default {
	method: "DELETE",
	path: "/accounts/{account_id}/cni/interconnects/{icon}",
	response: false,
	errors: {
		400: "BadRequestError",
		404: "NotFoundError",
		500: "InternalServerError",
	},
} as const;
