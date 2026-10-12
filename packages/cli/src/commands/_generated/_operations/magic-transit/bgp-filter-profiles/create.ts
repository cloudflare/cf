/** @generated from magic-bgp-create-filter-profile */
import { path } from "#api";

export default {
	method: "POST",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/magic/bgp/filter_profiles`,
	body: "json",
} as const;
