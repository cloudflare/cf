/** @generated from tenant.account.list */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/tenants/${request.tenant_id}/accounts`,
} as const;
