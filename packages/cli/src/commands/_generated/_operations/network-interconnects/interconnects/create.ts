/** @generated from network-interconnects.interconnects.create */
export default {
	method: "POST",
	path: "/accounts/{account_id}/cni/interconnects",
	body: "json",
	errors: {
		400: "BadRequestError",
		500: "InternalServerError",
	},
} as const;
