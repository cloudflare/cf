/** @generated from token-validation-config-create */
import { path } from "#api";

export default {
	method: "POST",
	path: (request: Record<string, unknown>) =>
		path`/zones/${request.zone_id}/token_validation/config`,
	body: "json",
	constants: {
		token_type: "JWT",
	},
} as const;
