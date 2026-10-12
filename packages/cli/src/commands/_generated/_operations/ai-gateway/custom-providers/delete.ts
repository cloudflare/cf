/** @generated from aig-config-delete-account-provider */
import { path } from "#api";

export default {
	method: "DELETE",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/ai-gateway/custom-providers/${request.id}`,
	errors: {
		404: "NotFoundError",
	},
} as const;
