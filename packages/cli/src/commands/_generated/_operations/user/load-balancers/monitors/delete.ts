/** @generated from load-balancer-monitors-delete-monitor */
import { path } from "#api";

export default {
	method: "DELETE",
	path: (request: Record<string, unknown>) =>
		path`/user/load_balancers/monitors/${request.monitor_id}`,
} as const;
