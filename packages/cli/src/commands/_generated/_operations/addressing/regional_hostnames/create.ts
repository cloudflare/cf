/** @generated from dls-zone-regional-hostnames-create */
import { path } from "#api";

export default {
	method: "POST",
	path: (request: Record<string, unknown>) =>
		path`/zones/${request.zone_id}/addressing/regional_hostnames`,
	body: "json",
} as const;
