/** @generated from magic-transit.bgp-filter-profiles.delete */
import { path } from "#api";

export default {
	method: "DELETE",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/magic/bgp/filter_profiles/${request.profile_id}`,
} as const;
