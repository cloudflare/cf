/** @generated from cws-update-workload */
import { path } from "#api";

export default {
	method: "PUT",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/cws/workloads/${request.workload_id}`,
	body: "json",
} as const;
