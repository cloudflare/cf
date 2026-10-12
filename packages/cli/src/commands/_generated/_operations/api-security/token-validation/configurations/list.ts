/** @generated from token-validation-config-list */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/zones/${request.zone_id}/token_validation/config`,
	query: ["page", "per_page"],
} as const;
