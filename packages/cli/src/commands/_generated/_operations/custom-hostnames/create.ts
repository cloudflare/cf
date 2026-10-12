/** @generated from custom-hostname-for-a-zone-create-custom-hostname */
import { path } from "#api";

export default {
	method: "POST",
	path: (request: Record<string, unknown>) =>
		path`/zones/${request.zone_id}/custom_hostnames`,
	body: "json",
} as const;
