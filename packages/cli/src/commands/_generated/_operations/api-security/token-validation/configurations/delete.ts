/** @generated from token-validation-config-delete */
import { path } from "#api";

export default {
	method: "DELETE",
	path: (request: Record<string, unknown>) =>
		path`/zones/${request.zone_id}/token_validation/config/${request.config_id}`,
} as const;
