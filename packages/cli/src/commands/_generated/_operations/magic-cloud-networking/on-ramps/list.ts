/** @generated from magic-cloud-networking.on-ramps.list */
export default {
	method: "GET",
	path: "/accounts/{account_id}/magic/cloud/onramps",
	query: ["order_by", "desc", "status", "vpcs"],
	errors: {
		400: "BadRequestError",
		401: "UnauthorizedError",
		403: "ForbiddenError",
		500: "InternalServerError",
	},
} as const;
