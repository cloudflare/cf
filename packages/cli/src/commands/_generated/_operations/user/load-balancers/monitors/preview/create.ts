/** @generated from load-balancer-monitors-preview-monitor */
import { path } from "#api";

export default {
	method: "POST",
	path: (request: Record<string, unknown>) =>
		path`/user/load_balancers/monitors/${request.monitor_id}/preview`,
	body: "json",
} as const;
