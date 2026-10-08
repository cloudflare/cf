/** @generated from magic-cloud-networking.on-ramps.address-spaces.edit */
export default {
	method: "PATCH",
	path: "/accounts/{account_id}/magic/cloud/onramps/magic_wan_address_space",
	body: "json",
	errors: {
		400: "BadRequestError",
		401: "UnauthorizedError",
		403: "ForbiddenError",
		404: "NotFoundError",
		422: "UnprocessableEntityError",
		500: "InternalServerError",
	},
} as const;
