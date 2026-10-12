/** @generated from magic-transit.cf1-sites.ramps.delete */
import { path } from "#api";

export default {
	method: "DELETE",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/magic/cf1_sites/${request.cf1_site_id}/ramps/${request.ramp_id}`,
} as const;
