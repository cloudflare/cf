/** @generated from magic-bgp-get-filter-profile */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/magic/bgp/filter_profiles/${request.profile_id}`,
} as const;
