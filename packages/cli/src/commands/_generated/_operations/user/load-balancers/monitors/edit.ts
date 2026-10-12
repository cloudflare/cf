/** @generated from load-balancer-monitors-patch-monitor */
import { path } from "#api";

export default {
	method: "PATCH",
	path: (request: Record<string, unknown>) =>
		path`/user/load_balancers/monitors/${request.monitor_id}`,
	body: "json",
} as const;
