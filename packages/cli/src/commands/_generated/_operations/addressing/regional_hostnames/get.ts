/** @generated from dls-zone-regional-hostnames-fetch */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/zones/${request.zone_id}/addressing/regional_hostnames/${request.hostname}`,
} as const;
