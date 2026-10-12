/** @generated from magic-transit.redundancy-groups.update */
import { path } from "#api";

export default {
	method: "PUT",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/magic/redundancy_groups/${request.redundancy_group_id}`,
	body: "json",
} as const;
