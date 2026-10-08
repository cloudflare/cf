/** @generated from network-interconnects.interconnects.list */
export default {
	method: "GET",
	path: "/accounts/{account_id}/cni/interconnects",
	query: ["site", "type", "cursor", "limit"],
	errors: {
		400: "BadRequestError",
		500: "InternalServerError",
	},
} as const;
