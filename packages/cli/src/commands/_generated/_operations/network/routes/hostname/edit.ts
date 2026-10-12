/** @generated from zero-trust-networks-route-hostname-update */
import { path } from "#api";

export default {
	method: "PATCH",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/zerotrust/routes/hostname/${request.hostname_route_id}`,
	body: "json",
} as const;
