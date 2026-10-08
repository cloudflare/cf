/** @generated from network-interconnects.settings.get */
export default {
	method: "GET",
	path: "/accounts/{account_id}/cni/settings",
	errors: {
		400: "BadRequestError",
		404: "NotFoundError",
		500: "InternalServerError",
	},
} as const;
