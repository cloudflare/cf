/** @generated from Tenants_retrieveTenant */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/tenants/${request.tenant_id}`,
} as const;
