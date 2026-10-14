/** @generated from load-balancers.monitors.delete */
import { path } from "#api";

export default {
	method: "DELETE",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/load_balancers/monitors/${request.monitor_id}`,
} as const;
