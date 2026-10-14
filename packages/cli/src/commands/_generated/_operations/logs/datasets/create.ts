/** @generated from logs.datasets.create */
import { path } from "#api";

export default {
	method: "POST",
	path: (request: Record<string, unknown>) =>
		path`/${request.account_or_zone}/${request.account_or_zone_id}/logs/explorer/datasets`,
	body: "json",
	errors: {
		400: "BadRequestError",
		403: "ForbiddenError",
		404: "NotFoundError",
		409: "ConflictError",
	},
} as const;
