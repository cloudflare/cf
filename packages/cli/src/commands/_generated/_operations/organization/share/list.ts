/** @generated from organization-shares-list */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/organizations/${request.organization_id}/shares`,
	query: [
		"status",
		"kind",
		"target_type",
		"resource_types",
		"order",
		"direction",
		"page",
		"per_page",
	],
} as const;
