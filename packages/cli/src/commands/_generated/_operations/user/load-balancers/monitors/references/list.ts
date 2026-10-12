/** @generated from load-balancer-monitors-list-monitor-references */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/user/load_balancers/monitors/${request.monitor_id}/references`,
} as const;
