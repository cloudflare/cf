/** @generated from magic-cloud-networking.cloud-integrations.delete */
export default {
	method: "DELETE",
	path: "/accounts/{account_id}/magic/cloud/providers/{provider_id}",
	errors: {
		400: "BadRequestError",
		401: "UnauthorizedError",
		403: "ForbiddenError",
		404: "NotFoundError",
		500: "InternalServerError",
	},
} as const;
