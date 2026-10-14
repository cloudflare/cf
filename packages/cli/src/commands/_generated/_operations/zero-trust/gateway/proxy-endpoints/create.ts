/** @generated from zero-trust.gateway.proxy-endpoints.create */
import { path } from "#api";

export default {
	method: "POST",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/gateway/proxy_endpoints`,
	body: "json",
} as const;
