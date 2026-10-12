/** @generated from magic-transit.redundancy-groups.get */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/magic/redundancy_groups/${request.redundancy_group_id}`,
} as const;
