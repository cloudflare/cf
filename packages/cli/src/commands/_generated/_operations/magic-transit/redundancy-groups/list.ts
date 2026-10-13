/** @generated from magic-transit.redundancy-groups.list */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/magic/redundancy_groups`,
} as const;
