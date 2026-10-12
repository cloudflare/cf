/** @generated from devices-resilience-retrieve-global-warp-override */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/devices/resilience/disconnect`,
} as const;
