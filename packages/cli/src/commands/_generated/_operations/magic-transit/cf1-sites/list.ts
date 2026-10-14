/** @generated from magic-transit.cf1-sites.list */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/magic/cf1_sites`,
} as const;
