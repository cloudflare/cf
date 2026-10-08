/** @generated from network-interconnects.interconnects.loa-default-name */
export default {
	method: "GET",
	path: "/accounts/{account_id}/cni/interconnects/{icon}/loa/default",
	errors: {
		400: "BadRequestError",
		404: "NotFoundError",
		500: "InternalServerError",
	},
} as const;
