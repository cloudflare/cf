/** @generated from load-balancers.monitors.references.get */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/load_balancers/monitors/${request.monitor_id}/references`,
} as const;
