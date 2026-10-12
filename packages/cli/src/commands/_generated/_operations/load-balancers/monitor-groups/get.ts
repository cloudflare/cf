/** @generated from account-load-balancer-monitor-groups-monitor-group-details */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/load_balancers/monitor_groups/${request.monitor_group_id}`,
} as const;
