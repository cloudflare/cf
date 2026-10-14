/** @generated from addressing.regional-hostnames.list */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/zones/${request.zone_id}/addressing/regional_hostnames`,
} as const;
