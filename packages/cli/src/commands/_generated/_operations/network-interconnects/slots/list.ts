/** @generated from network-interconnects.slots.list */
export default {
	method: "GET",
	path: "/accounts/{account_id}/cni/slots",
	query: ["address_contains", "site", "speed", "occupied", "cursor", "limit"],
	errors: {
		400: "BadRequestError",
		500: "InternalServerError",
	},
} as const;
