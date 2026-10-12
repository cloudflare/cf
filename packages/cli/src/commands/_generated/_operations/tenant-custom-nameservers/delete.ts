/** @generated from tenant-level-custom-nameservers-delete-tenant-custom-nameserver */
import { path } from "#api";

export default {
	method: "DELETE",
	path: (request: Record<string, unknown>) =>
		path`/tenants/${request.tenant_tag}/custom_ns/${request.custom_ns_id}`,
} as const;
