/** @generated from zero-trust.access.service-tokens.refresh */
import { path } from "#api";

export default {
	method: "POST",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/access/service_tokens/${request.service_token_id}/refresh`,
} as const;
