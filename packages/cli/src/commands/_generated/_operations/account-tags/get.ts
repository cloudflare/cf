/** @generated from generated:get:/{account_or_zone}/{account_or_zone_id}/tags */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/${request.account_or_zone}/${request.account_or_zone_id}/tags`,
	query: ["resource_id", "resource_type", "worker_id"],
} as const;
