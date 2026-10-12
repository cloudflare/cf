/** @generated from account-load-balancer-monitor-groups-list-monitor-groups */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/load_balancers/monitor_groups`,
} as const;
