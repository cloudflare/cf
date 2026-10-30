/** @generated from tenant-custom-nameservers.get */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/tenants/${request.tenant_id}/custom_ns`,
} as const;
