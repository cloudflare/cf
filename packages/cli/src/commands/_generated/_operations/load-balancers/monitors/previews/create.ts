/** @generated from load-balancers.monitors.previews.create */
import { path } from "#api";

export default {
	method: "POST",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/load_balancers/monitors/${request.monitor_id}/preview`,
	body: "json",
} as const;
