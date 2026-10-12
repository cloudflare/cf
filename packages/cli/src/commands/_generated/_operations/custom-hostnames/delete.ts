/** @generated from custom-hostname-for-a-zone-delete-custom-hostname-(-and-any-issued-ssl-certificates) */
import { path } from "#api";

export default {
	method: "DELETE",
	path: (request: Record<string, unknown>) =>
		path`/zones/${request.zone_id}/custom_hostnames/${request.custom_hostname_id}`,
} as const;
