/** @generated from zero-trust-gateway-operations-zero-trust-gateway-operation-details */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/gateway/operations/${request.operation_id}`,
} as const;
