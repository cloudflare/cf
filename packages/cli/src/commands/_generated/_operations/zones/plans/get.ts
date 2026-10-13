/** @generated from zones.plans.get */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/zones/${request.zone_id}/available_plans/${request.plan_identifier}`,
} as const;
