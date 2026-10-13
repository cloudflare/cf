/** @generated from leaked-credential-checks.get */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/zones/${request.zone_id}/leaked-credential-checks`,
} as const;
