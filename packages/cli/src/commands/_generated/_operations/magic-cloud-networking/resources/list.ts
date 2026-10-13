/** @generated from magic-cloud-networking.resources.list */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/magic/cloud/resources`,
	query: [
		"provider_id",
		"resource_type",
		"resource_id",
		"region",
		"resource_group",
		"managed",
		"search",
		"order_by",
		"desc",
		"per_page",
		"page",
		"cloudflare",
		"v2",
	],
	errors: {
		400: "BadRequestError",
		401: "UnauthorizedError",
		403: "ForbiddenError",
		404: "NotFoundError",
		500: "InternalServerError",
	},
} as const;
