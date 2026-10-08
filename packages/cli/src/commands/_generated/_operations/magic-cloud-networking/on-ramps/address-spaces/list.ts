/** @generated from magic-cloud-networking.on-ramps.address-spaces.list */
export default {
	method: "GET",
	path: "/accounts/{account_id}/magic/cloud/onramps/magic_wan_address_space",
	errors: {
		400: "BadRequestError",
		401: "UnauthorizedError",
		403: "ForbiddenError",
		404: "NotFoundError",
		500: "InternalServerError",
	},
} as const;
