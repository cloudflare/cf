/** @generated from zaraz.publish.create */
import { path } from "#api";

export default {
	method: "POST",
	path: (request: Record<string, unknown>) =>
		path`/zones/${request.zone_id}/settings/zaraz/publish`,
	body: "json",
} as const;
