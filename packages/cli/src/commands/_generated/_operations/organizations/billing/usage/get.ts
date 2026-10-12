/** @generated from organizations.billing.usage.get */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/organizations/${request.organization_id}/billable/usage`,
	query: ["from", "to"],
} as const;
