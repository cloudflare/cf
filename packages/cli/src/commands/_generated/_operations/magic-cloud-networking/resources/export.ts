/** @generated from resources-catalog-export */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/magic/cloud/resources/export`,
	query: [
		"provider_id",
		"resource_type",
		"resource_id",
		"region",
		"resource_group",
		"search",
		"order_by",
		"desc",
		"v2",
	],
	response: "binary-response",
	errors: {
		400: "BadRequestError",
		401: "UnauthorizedError",
		403: "ForbiddenError",
		404: "NotFoundError",
		500: "InternalServerError",
	},
} as const;
