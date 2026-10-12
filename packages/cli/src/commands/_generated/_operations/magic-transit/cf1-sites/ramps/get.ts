/** @generated from magic-cf1-sites-get-cf1-site-ramp */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/magic/cf1_sites/${request.cf1_site_id}/ramps/${request.ramp_id}`,
} as const;
