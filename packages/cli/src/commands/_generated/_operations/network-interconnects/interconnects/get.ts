/** @generated from network-interconnects.interconnects.get */
export default {
	method: "GET",
	path: "/accounts/{account_id}/cni/interconnects/{icon}",
	errors: {
		400: "BadRequestError",
		404: "NotFoundError",
		500: "InternalServerError",
	},
} as const;
