/** @generated from generated:post:/{account_or_zone}/{account_or_zone_id}/logs/explorer/query/sql */
import { path } from "#api";

export default {
	method: "POST",
	path: (request: Record<string, unknown>) =>
		path`/${request.account_or_zone}/${request.account_or_zone_id}/logs/explorer/query/sql`,
	errors: {
		400: "BadRequestError",
		403: "ForbiddenError",
		404: "NotFoundError",
		507: "InsufficientStorageError",
	},
} as const;
