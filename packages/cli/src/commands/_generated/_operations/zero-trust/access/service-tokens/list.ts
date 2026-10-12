/** @generated from generated:get:/{account_or_zone}/{account_or_zone_id}/access/service_tokens */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/${request.account_or_zone}/${request.account_or_zone_id}/access/service_tokens`,
	query: ["name", "search", "page", "per_page"],
} as const;
