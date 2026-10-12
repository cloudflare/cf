/** @generated from generated:get:/{account_or_zone}/{account_or_zone_id}/access/identity_providers */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/${request.account_or_zone}/${request.account_or_zone_id}/access/identity_providers`,
	query: ["scim_enabled", "page", "per_page"],
} as const;
