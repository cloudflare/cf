/** @generated from network-interconnects.cnis.list */
export default {
	method: "GET",
	path: "/accounts/{account_id}/cni/cnis",
	query: ["slot", "tunnel_id", "cursor", "limit"],
	errors: {
		400: "BadRequestError",
		500: "InternalServerError",
	},
} as const;
