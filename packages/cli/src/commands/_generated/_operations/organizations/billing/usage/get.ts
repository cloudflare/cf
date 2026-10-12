/** @generated from billable-usage-v2-get-organization-usage */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/organizations/${request.organization_id}/billable/usage`,
	query: ["from", "to"],
} as const;
