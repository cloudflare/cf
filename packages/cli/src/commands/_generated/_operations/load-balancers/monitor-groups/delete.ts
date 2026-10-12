/** @generated from account-load-balancer-monitor-groups-delete-monitor-group */
import { path } from "#api";

export default {
	method: "DELETE",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/load_balancers/monitor_groups/${request.monitor_group_id}`,
	errors: {
		412: "PreconditionFailedError",
	},
} as const;
