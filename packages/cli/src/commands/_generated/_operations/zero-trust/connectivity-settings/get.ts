/** @generated from zero-trust.connectivity-settings.get */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/zerotrust/connectivity_settings`,
} as const;
