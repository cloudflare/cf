/** @generated from generated:get:/{account_or_zone}/{account_or_zone_id}/pay-per-use/usage-stats */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/${request.account_or_zone}/${request.account_or_zone_id}/pay-per-use/usage-stats`,
	query: ["since", "until", "page", "per_page"],
	errors: {
		400: "BadRequestError",
		403: "ForbiddenError",
		500: "InternalServerError",
	},
} as const;
