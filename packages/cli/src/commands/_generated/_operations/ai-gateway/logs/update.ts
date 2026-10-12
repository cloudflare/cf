/** @generated from aig-config-patch-gateway-log */
import { path } from "#api";

export default {
	method: "PATCH",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/ai-gateway/gateways/${request.gateway_id}/logs/${request.id}`,
	body: "json",
	errors: {
		404: "NotFoundError",
	},
} as const;
