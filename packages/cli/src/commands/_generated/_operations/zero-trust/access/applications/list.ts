/** @generated from zero-trust.access.applications.list */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/${request.account_or_zone}/${request.account_or_zone_id}/access/apps`,
	query: [
		"name",
		"domain",
		"aud",
		"target_attributes",
		"exact",
		"search",
		"page",
		"per_page",
	],
} as const;
