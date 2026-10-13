/** @generated from media.usage.get */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/${request.account_or_zone}/${request.account_or_zone_id}/media/usage`,
	query: ["metrics", "since", "until", "time_delta", "limit", "filters"],
	errors: {
		400: "BadRequestError",
		401: "UnauthorizedError",
		403: "ForbiddenError",
	},
} as const;
