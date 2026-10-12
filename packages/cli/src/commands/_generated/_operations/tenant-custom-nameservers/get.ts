/** @generated from tenant-level-custom-nameservers-list-tenant-custom-nameservers */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/tenants/${request.tenant_tag}/custom_ns`,
} as const;
