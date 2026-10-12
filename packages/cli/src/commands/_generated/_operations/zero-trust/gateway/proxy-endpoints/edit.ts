/** @generated from zero-trust-gateway-proxy-endpoints-update-proxy-endpoint */
import { path } from "#api";

export default {
	method: "PATCH",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/gateway/proxy_endpoints/${request.proxy_endpoint_id}`,
	body: "json",
} as const;
