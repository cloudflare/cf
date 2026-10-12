/** @generated from magic-transit.redundancy-groups.create */
import { path } from "#api";

export default {
	method: "POST",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/magic/redundancy_groups`,
	body: "json",
} as const;
