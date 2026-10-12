/** @generated from healthchecks.previews.create */
import { path } from "#api";

export default {
	method: "POST",
	path: (request: Record<string, unknown>) =>
		path`/zones/${request.zone_id}/healthchecks/preview`,
	body: "json",
} as const;
