/** @generated from inspect_spf */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/zones/${request.zone_id}/email/auth/spf/inspect`,
	query: ["id"],
} as const;
