/** @generated from custom-hostname-for-a-zone-edit-custom-hostname */
import { path } from "#api";

export default {
	method: "PATCH",
	path: (request: Record<string, unknown>) =>
		path`/zones/${request.zone_id}/custom_hostnames/${request.custom_hostname_id}`,
	body: "json",
} as const;
