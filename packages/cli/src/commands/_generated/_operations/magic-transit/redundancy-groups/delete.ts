/** @generated from magic-redundancy-groups-delete-redundancy-group */
import { path } from "#api";

export default {
	method: "DELETE",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/magic/redundancy_groups/${request.redundancy_group_id}`,
} as const;
