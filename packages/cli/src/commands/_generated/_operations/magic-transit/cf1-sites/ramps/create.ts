/** @generated from magic-transit.cf1-sites.ramps.create */
import { path } from "#api";

export default {
	method: "POST",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/magic/cf1_sites/${request.cf1_site_id}/ramps`,
	body: "json",
} as const;
