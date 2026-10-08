/** @generated from magic-cloud-networking.cloud-integrations.list */
export default {
	method: "GET",
	path: "/accounts/{account_id}/magic/cloud/providers",
	query: ["status", "order_by", "desc", "cloudflare"],
	errors: {
		400: "BadRequestError",
		401: "UnauthorizedError",
		403: "ForbiddenError",
		500: "InternalServerError",
	},
} as const;
