/** @generated from zero-trust.access.service-tokens.update */
import { path } from "#api";

export default {
	method: "PUT",
	path: (request: Record<string, unknown>) =>
		path`/${request.account_or_zone}/${request.account_or_zone_id}/access/service_tokens/${request.service_token_id}`,
	body: "json",
} as const;
