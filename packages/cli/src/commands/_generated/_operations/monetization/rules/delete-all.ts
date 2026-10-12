/** @generated from monetization.rules.delete-all */
import { path } from "#api";

export default {
	method: "DELETE",
	path: (request: Record<string, unknown>) =>
		path`/zones/${request.zone_id}/monetization/rules`,
} as const;
