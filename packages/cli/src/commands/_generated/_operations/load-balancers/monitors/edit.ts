/** @generated from load-balancers.monitors.edit */
import { path } from "#api";

export default {
	method: "PATCH",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/load_balancers/monitors/${request.monitor_id}`,
	body: "json",
} as const;
