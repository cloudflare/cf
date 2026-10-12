/** @generated from Tenants_validAccountTypes */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/tenants/${request.tenant_id}/account_types`,
} as const;
