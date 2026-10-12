/** @generated from account-load-balancer-monitor-groups-create-monitor-group */
import { path } from "#api";

export default {
	method: "POST",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/load_balancers/monitor_groups`,
	body: "json",
	errors: {
		412: "PreconditionFailedError",
	},
} as const;
