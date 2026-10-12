/** @generated from cws-delete-workload */
import { path } from "#api";

export default {
	method: "DELETE",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/cws/workloads/${request.workload_id}`,
} as const;
