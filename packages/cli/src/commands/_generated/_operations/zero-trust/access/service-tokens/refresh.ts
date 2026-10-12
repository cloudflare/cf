/** @generated from access-service-tokens-refresh-a-service-token */
import { path } from "#api";

export default {
	method: "POST",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/access/service_tokens/${request.service_token_id}/refresh`,
} as const;
