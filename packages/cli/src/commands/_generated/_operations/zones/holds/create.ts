/** @generated from zones.holds.create */
import { path } from "#api";

export default {
	method: "POST",
	path: (request: Record<string, unknown>) =>
		path`/zones/${request.zone_id}/hold`,
	query: ["include_subdomains"],
} as const;
