/** @generated from network-interconnects.interconnects.loa */
export default {
	method: "GET",
	path: "/accounts/{account_id}/cni/interconnects/{icon}/loa",
	query: ["name"],
	response: false,
	errors: {
		400: "BadRequestError",
		404: "NotFoundError",
		500: "InternalServerError",
	},
} as const;
