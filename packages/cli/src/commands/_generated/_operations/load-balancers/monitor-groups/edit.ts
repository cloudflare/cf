/** @generated from load-balancers.monitor-groups.edit */
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
