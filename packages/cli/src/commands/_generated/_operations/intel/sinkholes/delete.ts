/** @generated from sinkhole-config-delete-sinkhole */
import { path } from "#api";

export default {
	method: "DELETE",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/intel/sinkholes/${request.sinkhole_id}`,
	errors: {
		409: "ConflictError",
	},
} as const;
