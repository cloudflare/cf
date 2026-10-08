/** @generated from network-interconnects.slots.get */
export default {
	method: "GET",
	path: "/accounts/{account_id}/cni/slots/{slot}",
	errors: {
		400: "BadRequestError",
		404: "NotFoundError",
		500: "InternalServerError",
	},
} as const;
