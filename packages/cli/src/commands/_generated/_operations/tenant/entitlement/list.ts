/** @generated from tenant.entitlement.list */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/tenants/${request.tenant_id}/entitlements`,
} as const;
