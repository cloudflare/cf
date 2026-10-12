/** @generated from dnssec-edit-dnssec-status */
import { path } from "#api";

export default {
	method: "PATCH",
	path: (request: Record<string, unknown>) =>
		path`/zones/${request.zone_id}/dnssec`,
	body: "json",
} as const;
