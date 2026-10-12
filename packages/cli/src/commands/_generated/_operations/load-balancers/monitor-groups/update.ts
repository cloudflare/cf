/** @generated from load-balancers.monitor-groups.update */
import { path } from "#api";

export default {
	method: "PUT",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/load_balancers/monitor_groups/${request.monitor_group_id}`,
	body: "json",
	errors: {
		412: "PreconditionFailedError",
	},
} as const;
