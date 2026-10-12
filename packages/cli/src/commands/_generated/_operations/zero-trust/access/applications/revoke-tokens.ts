/** @generated from zero-trust.access.applications.revoke-tokens */
import { path } from "#api";

export default {
	method: "POST",
	path: (request: Record<string, unknown>) =>
		path`/${request.account_or_zone}/${request.account_or_zone_id}/access/apps/${request.app_id}/revoke_tokens`,
} as const;
