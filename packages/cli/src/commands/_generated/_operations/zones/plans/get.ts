/** @generated from zone-rate-plan-available-plan-details */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/zones/${request.zone_id}/available_plans/${request.plan_identifier}`,
} as const;
