/** @generated from user.load-balancers.monitors.get */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/user/load_balancers/monitors/${request.monitor_id}`,
} as const;
