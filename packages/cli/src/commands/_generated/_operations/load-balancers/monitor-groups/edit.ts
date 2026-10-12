/** @generated from account-load-balancer-monitor-groups-patch-monitor-group */
import { path } from "#api";

export default {
	method: "PATCH",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/load_balancers/monitor_groups/${request.monitor_group_id}`,
	body: "json",
	errors: {
		412: "PreconditionFailedError",
	},
} as const;
