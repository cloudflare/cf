/** @generated from access-gateway-ca-add-an-SSH-ca */
import { path } from "#api";

export default {
	method: "POST",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/access/gateway_ca`,
} as const;
