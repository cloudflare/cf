/** @generated from ai-gateway.custom-domains.delete */
import { path } from "#api";

export default {
	method: "DELETE",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/ai-gateway/gateways/${request.gateway_id}/custom-domains/${request.hostname}`,
	errors: {
		404: "NotFoundError",
	},
} as const;
