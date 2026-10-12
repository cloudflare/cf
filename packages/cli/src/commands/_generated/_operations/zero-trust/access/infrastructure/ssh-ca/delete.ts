/** @generated from access-gateway-ca-delete-an-SSH-ca */
import { path } from "#api";

export default {
	method: "DELETE",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/access/gateway_ca/${request.certificate_id}`,
} as const;
