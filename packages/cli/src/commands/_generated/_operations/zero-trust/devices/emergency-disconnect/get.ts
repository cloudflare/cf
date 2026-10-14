/** @generated from zero-trust.devices.emergency-disconnect.get */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/devices/resilience/disconnect`,
} as const;
