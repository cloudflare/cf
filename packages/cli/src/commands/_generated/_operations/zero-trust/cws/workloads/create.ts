/** @generated from cws-create-workload */
import { path } from "#api";

export default {
	method: "POST",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/cws/workloads`,
	body: "json",
} as const;
