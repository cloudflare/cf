/** @generated from addressing.regional-hostnames.edit */
import { path } from "#api";

export default {
	method: "PATCH",
	path: (request: Record<string, unknown>) =>
		path`/zones/${request.zone_id}/addressing/regional_hostnames/${request.hostname}`,
	body: "json",
} as const;
