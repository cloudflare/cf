/** @generated from custom-hostname-for-a-zone-custom-hostname-details */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/zones/${request.zone_id}/custom_hostnames/${request.custom_hostname_id}`,
} as const;
