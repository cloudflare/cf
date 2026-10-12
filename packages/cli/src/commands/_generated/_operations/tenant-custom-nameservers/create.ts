/** @generated from tenant-level-custom-nameservers-add-tenant-custom-nameserver */
import { path } from "#api";

export default {
	method: "POST",
	path: (request: Record<string, unknown>) =>
		path`/tenants/${request.tenant_tag}/custom_ns`,
	body: "json",
} as const;
