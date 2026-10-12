/** @generated from access-gateway-ca-list-SSH-ca */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/access/gateway_ca`,
} as const;
