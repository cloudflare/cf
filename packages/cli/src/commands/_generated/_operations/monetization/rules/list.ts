/** @generated from monetization.rules.list */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/zones/${request.zone_id}/monetization/rules`,
	errors: {
		404: "NotFoundError",
	},
} as const;
