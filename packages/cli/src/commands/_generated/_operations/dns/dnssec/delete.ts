/** @generated from dnssec-delete-dnssec-records */
import { path } from "#api";

export default {
	method: "DELETE",
	path: (request: Record<string, unknown>) =>
		path`/zones/${request.zone_id}/dnssec`,
} as const;
