/** @generated from network-interconnects.cnis.create */
export default {
	method: "POST",
	path: "/accounts/{account_id}/cni/cnis",
	body: "json",
	errors: {
		400: "BadRequestError",
		409: "ConflictError",
		500: "InternalServerError",
	},
} as const;
