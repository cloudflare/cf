/** @generated from cws-get-workload */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/cws/workloads/${request.workload_id}`,
} as const;
