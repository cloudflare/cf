/** @generated from zone-rate-plan-list-available-rate-plans */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/zones/${request.zone_id}/available_rate_plans`,
} as const;
