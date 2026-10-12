/** @generated from zone-rate-plan-list-available-plans */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/zones/${request.zone_id}/available_plans`,
} as const;
