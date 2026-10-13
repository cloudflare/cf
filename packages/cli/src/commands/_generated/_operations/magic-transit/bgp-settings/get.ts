/** @generated from magic-transit.bgp-settings.get */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/magic/bgp/settings`,
} as const;
