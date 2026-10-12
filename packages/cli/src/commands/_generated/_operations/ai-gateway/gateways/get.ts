/** @generated from aig-config-fetch-gateway */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/ai-gateway/gateways/${request.id}`,
	errors: {
		404: "NotFoundError",
	},
} as const;
