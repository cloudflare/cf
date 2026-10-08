/** @generated from dls.regions.get */
export default {
	method: "GET",
	path: "/accounts/{account_id}/dls/regions/{region_id}",
	errors: {
		401: "UnauthorizedError",
		403: "ForbiddenError",
		404: "NotFoundError",
		500: "InternalServerError",
	},
} as const;
