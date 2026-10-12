/** @generated from magic-transit.bgp-filter-profiles.get */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/magic/bgp/filter_profiles/${request.profile_id}`,
} as const;
