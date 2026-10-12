/** @generated from devices-resilience-set-global-warp-override */
import { path } from "#api";

export default {
	method: "POST",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/devices/resilience/disconnect`,
	body: "json",
} as const;
