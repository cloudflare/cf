/** @generated from logs.datasets.list */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/${request.account_or_zone}/${request.account_or_zone_id}/logs/explorer/datasets`,
	query: ["include_zones"],
	errors: {
		400: "BadRequestError",
		403: "ForbiddenError",
		404: "NotFoundError",
	},
} as const;
