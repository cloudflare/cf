/** @generated from zero-trust-gateway-proxy-endpoints-proxy-endpoint-details */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/gateway/proxy_endpoints/${request.proxy_endpoint_id}`,
} as const;
