/** @generated from ai-gateway.gateways.delete */
import { path } from "#api";

export default {
	method: "DELETE",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/ai-gateway/gateways/${request.id}`,
	errors: {
		404: "NotFoundError",
	},
} as const;
