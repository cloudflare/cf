/** @generated from addressing.regional-hostnames.get */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/zones/${request.zone_id}/addressing/regional_hostnames/${request.hostname}`,
} as const;
