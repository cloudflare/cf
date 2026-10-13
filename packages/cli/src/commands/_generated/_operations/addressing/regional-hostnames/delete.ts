/** @generated from addressing.regional-hostnames.delete */
import { path } from "#api";

export default {
	method: "DELETE",
	path: (request: Record<string, unknown>) =>
		path`/zones/${request.zone_id}/addressing/regional_hostnames/${request.hostname}`,
} as const;
