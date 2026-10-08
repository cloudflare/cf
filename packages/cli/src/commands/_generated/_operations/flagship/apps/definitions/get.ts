/** @generated from flagship.apps.definitions.get */
export default {
	method: "GET",
	path: "/accounts/{account_id}/flagship/apps/{app_id}/definitions",
	headers: ["If-None-Match"],
	errors: {
		401: "UnauthorizedError",
		403: "ForbiddenError",
		404: "NotFoundError",
		500: "InternalServerError",
		503: "ServiceUnavailableError",
	},
} as const;
