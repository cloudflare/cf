/** @generated from Tenants_listEntitlements */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/tenants/${request.tenant_id}/entitlements`,
} as const;
