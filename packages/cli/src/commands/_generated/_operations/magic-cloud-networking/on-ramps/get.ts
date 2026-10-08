/** @generated from magic-cloud-networking.on-ramps.get */
export default {
	method: "GET",
	path: "/accounts/{account_id}/magic/cloud/onramps/{onramp_id}",
	query: ["status", "vpcs", "post_apply_resources", "planned_resources"],
	errors: {
		400: "BadRequestError",
		401: "UnauthorizedError",
		403: "ForbiddenError",
		404: "NotFoundError",
		500: "InternalServerError",
	},
} as const;
