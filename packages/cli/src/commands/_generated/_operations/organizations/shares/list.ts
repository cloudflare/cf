/** @generated from organizations.shares.list */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/organizations/${request.organization_id}/shares`,
	query: ["status", "order", "direction", "page", "per_page"],
} as const;
