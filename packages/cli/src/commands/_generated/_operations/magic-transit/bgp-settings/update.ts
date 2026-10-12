/** @generated from magic-transit.bgp-settings.update */
import { path } from "#api";

export default {
	method: "PUT",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/magic/bgp/settings`,
	body: "json",
} as const;
