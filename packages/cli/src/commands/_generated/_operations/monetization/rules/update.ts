/** @generated from monetization.rules.update */
import { path } from "#api";

export default {
	method: "PUT",
	path: (request: Record<string, unknown>) =>
		path`/zones/${request.zone_id}/monetization/rules`,
	body: "json",
	errors: {
		403: "ForbiddenError",
	},
} as const;
