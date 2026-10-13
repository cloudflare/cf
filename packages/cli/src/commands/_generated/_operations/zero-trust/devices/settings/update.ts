/** @generated from zero-trust.devices.settings.update */
import { path } from "#api";

export default {
	method: "PATCH",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/devices/settings`,
	body: "json",
} as const;
