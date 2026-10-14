/** @generated from leaked-credential-checks.update */
import { path } from "#api";

export default {
	method: "POST",
	path: (request: Record<string, unknown>) =>
		path`/zones/${request.zone_id}/leaked-credential-checks`,
	body: "json",
} as const;
