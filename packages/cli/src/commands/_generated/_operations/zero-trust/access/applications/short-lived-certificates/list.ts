/** @generated from zero-trust.access.applications.short-lived-certificates.list */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/${request.account_or_zone}/${request.account_or_zone_id}/access/apps/ca`,
	query: ["page", "per_page"],
} as const;
