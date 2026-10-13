/** @generated from zero-trust.access.rule-groups.list */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/${request.account_or_zone}/${request.account_or_zone_id}/access/groups`,
	query: ["name", "search", "page", "per_page"],
} as const;
