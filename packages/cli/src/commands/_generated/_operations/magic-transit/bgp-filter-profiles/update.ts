/** @generated from magic-transit.bgp-filter-profiles.update */
import { path } from "#api";

export default {
	method: "PUT",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/magic/bgp/filter_profiles/${request.profile_id}`,
	body: "json",
} as const;
