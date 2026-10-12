/** @generated from generated:get:/{account_or_zone}/{account_or_zone_id}/logs/explorer/datasets/{dataset_id} */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/${request.account_or_zone}/${request.account_or_zone_id}/logs/explorer/datasets/${request.dataset_id}`,
	errors: {
		400: "BadRequestError",
		403: "ForbiddenError",
		404: "NotFoundError",
	},
} as const;
