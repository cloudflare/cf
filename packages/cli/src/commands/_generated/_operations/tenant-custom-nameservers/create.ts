/** @generated from tenant-custom-nameservers.create */
import { path } from "#api";

export default {
	method: "POST",
	path: (request: Record<string, unknown>) =>
		path`/tenants/${request.tenant_id}/custom_ns`,
	body: "json",
} as const;
