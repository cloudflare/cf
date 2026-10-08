/** @generated from network-interconnects.settings.update */
export default {
	method: "PUT",
	path: "/accounts/{account_id}/cni/settings",
	body: "json",
	errors: {
		400: "BadRequestError",
		404: "NotFoundError",
		500: "InternalServerError",
	},
} as const;
