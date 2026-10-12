/** @generated from api-security.token-validation.configurations.credentials.edit */
import { path } from "#api";

export default {
	method: "PATCH",
	path: (request: Record<string, unknown>) =>
		path`/zones/${request.zone_id}/token_validation/config/${request.config_id}/credentials`,
	body: "json",
} as const;
