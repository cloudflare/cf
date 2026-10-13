/** @generated from api-security.token-validation.configurations.get */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/zones/${request.zone_id}/token_validation/config/${request.config_id}`,
} as const;
