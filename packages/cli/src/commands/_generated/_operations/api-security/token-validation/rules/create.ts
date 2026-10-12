/** @generated from api-security.token-validation.rules.create */
import { path } from "#api";

export default {
	method: "POST",
	path: (request: Record<string, unknown>) =>
		path`/zones/${request.zone_id}/token_validation/rules`,
	body: "json",
} as const;
